import { NextRequest, NextResponse } from 'next/server';
import { stripe, verifyWebhookSignature } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { sendSubscriptionConfirmationEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * Stripe Webhook Handler
 * Processes payment events and updates user subscription status
 * 
 * Events:
 * - checkout.session.completed: User purchased subscription
 * - charge.succeeded: Payment succeeded
 * - customer.subscription.updated: Subscription changed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook authenticity
    const event = verifyWebhookSignature(body, signature);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);

    if (error instanceof Error && error.message.includes('No API Key provided')) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 * Update user subscription tier and dates
 */
async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.client_reference_id;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing userId or planId in webhook');
    return;
  }

  // Get subscription duration from metadata
  const planDurations: Record<string, number> = {
    PREMIUM_3M: 3,
    PREMIUM_12M: 12,
    PREMIUM_24M: 24,
  };

  const durationMonths = planDurations[planId] || 3;
  const now = new Date();
  const subscriptionEnd = new Date(now);
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + durationMonths);

  // Update user in Supabase
  const { data: userData, error: userError } = await supabase
    .from('users')
    .update({
      subscription_tier: planId,
      subscription_start: now.toISOString(),
      subscription_end: subscriptionEnd.toISOString(),
      stripe_customer_id: session.customer,
      updated_at: now.toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (userError) {
    console.error('Failed to update user subscription:', userError);
    return;
  }

  // Send confirmation email
  if (userData?.email) {
    try {
      await sendSubscriptionConfirmationEmail(
        userData.email,
        userData.username,
        planId,
        subscriptionEnd
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the webhook if email fails
    }
  }

  console.log(`✅ Subscription activated for user ${userId}: ${planId}`);
}

/**
 * Handle successful charge
 */
async function handleChargeSucceeded(charge: any) {
  const customerId = charge.customer;

  // Log successful charge for analytics
  console.log(`💰 Charge succeeded: ${charge.id} for customer ${customerId}`);

  // Optional: Update analytics/logging table
  if (supabase.from('payment_logs')) {
    await supabase.from('payment_logs').insert({
      stripe_charge_id: charge.id,
      stripe_customer_id: customerId,
      amount: charge.amount,
      currency: charge.currency,
      status: 'succeeded',
      created_at: new Date().toISOString(),
    }).catch((err) => console.error('Failed to log payment:', err));
  }
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(charge: any) {
  const customerId = charge.customer;

  console.error(`❌ Charge failed: ${charge.id} for customer ${customerId}`);
  console.error(`Reason: ${charge.failure_message}`);

  // Optional: Notify user of failed payment
  if (customerId) {
    const { data: users } = await supabase
      .from('users')
      .select('email')
      .eq('stripe_customer_id', customerId)
      .single()
      .catch(() => ({ data: null }));

    if (users?.email) {
      try {
        await sendPaymentFailedEmail(
          users.email,
          charge.failure_message
        );
      } catch (err) {
        console.error('Failed to send payment failed email:', err);
      }
    }
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer;

  // Find user and reset to FREE tier
  const { data: users, error: findError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()
    .catch(() => ({ data: null }));

  if (!users) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription
  const { error: updateError } = await supabase
    .from('users')
    .update({
      subscription_tier: 'FREE',
      subscription_start: null,
      subscription_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', users.id);

  if (updateError) {
    console.error('Failed to reset user subscription:', updateError);
    return;
  }

  console.log(`✋ Subscription cancelled for user ${users.id}`);

  // Notify user
  try {
    await sendSubscriptionCancelledEmail(users.email);
  } catch (err) {
    console.error('Failed to send cancellation email:', err);
  }
}

/**
 * Send payment failed email
 */
async function sendPaymentFailedEmail(email: string, reason: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@xlibertine.com',
        to: email,
        subject: 'Votre paiement n\'a pas pu être traité',
        html: `
          <h2>Erreur de paiement</h2>
          <p>Nous n'avons pas pu traiter votre paiement pour votre abonnement xlibertine.</p>
          <p><strong>Raison:</strong> ${reason}</p>
          <p>Veuillez mettre à jour votre moyen de paiement ou contacter le support.</p>
          <a href="https://xlibertine.com/profil">Mettre à jour le paiement</a>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
  }
}

/**
 * Send subscription cancelled email
 */
async function sendSubscriptionCancelledEmail(email: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
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

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }
}
