import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, verifyWebhookSignature } from '@/lib/stripe';
import { sendAbonnementConfirmationEmail } from '@/lib/email';

// Client privilégié (clé de service) : le webhook arrive depuis Stripe, sans
// session utilisateur. Il doit pouvoir écrire dans `profiles` en contournant
// le RLS. À n'utiliser qu'ici — jamais côté client.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
);

/**
 * Gestionnaire du webhook Stripe. À monter sur la route de paiement :
 *   export const POST = handleStripeWebhook;
 *
 * Écrit dans la table `profiles` (snake_case) — la source unique de vérité
 * lue par lib/auth-serveur.ts et lib/premium.ts. L'ancienne table `users`
 * n'est plus utilisée : sinon un paiement réussi n'accordait jamais Premium.
 */
export async function handleStripeWebhook(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    const event = verifyWebhookSignature(body, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleAbonnementDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);

    if (error instanceof Error && error.message.includes('No API Key provided')) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Paiement réussi : active l'abonnement Premium dans `profiles`.
 */
async function handleCheckoutSessionCompleted(session: any) {
  // client_reference_id peut prendre deux formes :
  //  - "userId"         → Chemin B (Checkout Session), planId est dans metadata
  //  - "userId|planId"   → Chememin A (Payment Link), planId encodé dans le ref
  //    car les Payment Links n'acceptent pas metadata via l'URL.
  const ref = session.client_reference_id || '';
  let userId: string | undefined;
  let planId: string | undefined;
  if (ref.includes('|')) {
    [userId, planId] = ref.split('|');
  } else {
    userId = ref;
    planId = session.metadata?.planId;
  }

  if (!userId || !planId) {
    console.error('Missing userId or planId in webhook');
    return;
  }

  // Facturation MENSUELLE récurrente : le premier paiement ne couvre qu'un
  // seul mois. Les renouvellements mensuels étendent `subscription_end` via
  // l'événement `invoice.paid` (voir handleInvoicePaid).
  const now = new Date();
  const subscriptionEnd = new Date(now);
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

  // Mise à jour du profil (snake_case) — pas la table `users`.
  const { data: profileData, error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: planId,
      subscription_start: now.toISOString(),
      subscription_end: subscriptionEnd.toISOString(),
      stripe_customer_id: session.customer,
      updated_at: now.toISOString(),
    })
    .eq('id', userId)
    .select('email, username')
    .single();

  if (error) {
    console.error('Failed to update profile subscription:', error);
    return;
  }

  if (profileData?.email) {
    try {
      await sendAbonnementConfirmationEmail(
        profileData.email,
        profileData.username,
        planId,
        subscriptionEnd
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }
  }

  console.log(`✅ Abonnement activated for user ${userId}: ${planId}`);
}

/**
 * Renouvellement mensuel réussi : étend `subscription_end` jusqu'à la fin de
 * la période facturée. Idempotent — reprendre la même facture remettrait le
 * même `period.end`, sans double-crédit.
 */
async function handleInvoicePaid(invoice: any) {
  const customerId = invoice.customer;
  if (!customerId) return;

  // `period.end` (timestamp unix) = date jusqu'à laquelle ce mois est payé.
  const line = invoice.lines?.data?.[0];
  const periodEnd = line?.period?.end;
  if (!periodEnd) {
    console.log('invoice.paid sans period.end — ignoré');
    return;
  }

  const subscriptionEnd = new Date(periodEnd * 1000);

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_end: subscriptionEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to extend subscription_end on invoice.paid:', error);
    return;
  }

  console.log(`🔁 Abonnement renouvelé jusqu'au ${subscriptionEnd.toISOString()} (customer ${customerId})`);
}

/**
 * Paiement réussi : journalisation analytique.
 */
async function handleChargeSucceeded(charge: any) {
  console.log(`💰 Charge succeeded: ${charge.id} for customer ${charge.customer}`);
  try {
    await supabase.from('payment_logs').insert({
      stripe_charge_id: charge.id,
      stripe_customer_id: charge.customer,
      amount: charge.amount,
      currency: charge.currency,
      status: 'succeeded',
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log payment:', err);
  }
}

/**
 * Paiement échoué : notifie l'utilisateur concerné.
 */
async function handleChargeFailed(charge: any) {
  console.error(`❌ Charge failed: ${charge.id} — ${charge.failure_message}`);
  const customerId = charge.customer;
  if (!customerId) return;

  let profile: { email: string } | null = null;
  try {
    const result = await supabase
      .from('profiles')
      .select('email')
      .eq('stripe_customer_id', customerId)
      .single();
    profile = result.data;
  } catch {
    profile = null;
  }

  if (profile?.email) {
    try {
      await sendPaymentFailedEmail(profile.email, charge.failure_message);
    } catch (err) {
      console.error('Failed to send payment failed email:', err);
    }
  }
}

/**
 * Abonnement annulé : repasse le profil en offre FREE.
 */
async function handleAbonnementDeleted(subscription: any) {
  const customerId = subscription.customer;

  let profile: { id: string; email: string } | null = null;
  try {
    const result = await supabase
      .from('profiles')
      .select('id, email')
      .eq('stripe_customer_id', customerId)
      .single();
    profile = result.data;
  } catch {
    profile = null;
  }

  if (!profile) {
    console.error('Profile not found for customer:', customerId);
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'FREE',
      subscription_start: null,
      subscription_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (error) {
    console.error('Failed to reset profile subscription:', error);
    return;
  }

  console.log(`✋ Abonnement cancelled for user ${profile.id}`);
  try {
    await sendAbonnementCancelledEmail(profile.email);
  } catch (err) {
    console.error('Failed to send cancellation email:', err);
  }
}

async function sendPaymentFailedEmail(email: string, reason: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@xlibertine.com',
        to: email,
        subject: "Votre paiement n'a pas pu être traité",
        html: `
          <h2>Erreur de paiement</h2>
          <p>Nous n'avons pas pu traiter votre paiement pour votre abonnement xlibertine.</p>
          <p><strong>Raison:</strong> ${reason}</p>
          <p>Veuillez mettre à jour votre moyen de paiement ou contacter le support.</p>
          <a href="https://xlibertine.com/profil">Mettre à jour le paiement</a>
        `,
      }),
    });
    if (!response.ok) throw new Error(`Resend API error: ${response.statusText}`);
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
  }
}

async function sendAbonnementCancelledEmail(email: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@xlibertine.com',
        to: email,
        subject: 'Votre abonnement xlibertine a été annulé',
        html: `
          <h2>Abonnement annulé</h2>
          <p>Votre abonnement xlibertine a été annulé.</p>
          <p>Vous pouvez toujours utiliser votre compte avec l'offre Découverte (gratuite).</p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <a href="https://xlibertine.com">Retourner à xlibertine</a>
        `,
      }),
    });
    if (!response.ok) throw new Error(`Resend API error: ${response.statusText}`);
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }
}