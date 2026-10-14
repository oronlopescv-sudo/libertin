import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature, stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { aplicaEnvRuntime } from './env-runtime';
import { sendAbonnementConfirmationEmail, sendAbonnementRenewalEmail } from '@/lib/email';
import { EVENT_PLANS } from '@/lib/events';
import type { EventPlanType } from '@/lib/types';

// Client privilégié (clé de service) : le webhook arrive depuis Stripe, sans
// session utilisateur. Il doit pouvoir écrire dans `profiles` en contournant
// le RLS. À n'utiliser qu'ici — jamais côté client. Ao aplicar o .env-runtime
// ANTES: sem isso este módulo nasceria com as chaves antigas do painel.
aplicaEnvRuntime();
const criaSessaoStripe = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key',
    { auth: { persistSession: false } }
  );
const supabase = criaSessaoStripe();

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

    let event: ReturnType<typeof verifyWebhookSignature>;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (erroAssinatura) {
      const msg = erroAssinatura instanceof Error ? erroAssinatura.message : '';
      // Falta de configuração (chave/segredo ausentes) é um erro NOSSO: segue
      // para o catch geral (500). Assinatura que não confere é pedido inválido.
      if (
        msg === 'Stripe not configured' ||
        msg.includes('STRIPE_WEBHOOK_SECRET not set') ||
        msg.includes('No API Key provided')
      ) {
        throw erroAssinatura;
      }
      console.warn('Webhook Stripe recusado: assinatura inválida');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        // Sessões de compra de anúncio (eventos) têm eventId em metadata e
        // NÃO devem ativar uma assinatura — só publicar o anúncio pago.
        if (event.data.object.metadata?.eventId) {
          await handleEventPaid(event.data.object);
        } else {
          await handleCheckoutSessionCompleted(event.data.object);
        }
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

const PLANOS_PAGOS = SUBSCRIPTION_PLANS.filter((p) => p.id !== 'FREE').map((p) => p.id as string);

/**
 * Descobre qual plano foi REALMENTE pago numa sessão de Payment Link, pelos
 * produtos das linhas da compra, comparados com STRIPE_PRODUCT_<PLANO>.
 *
 *  - Nenhum STRIPE_PRODUCT_* definido  -> não dá para verificar: devolve o plano
 *    declarado (comportamento antigo) com um aviso.
 *  - Produtos configurados             -> devolve o plano cujo produto foi pago
 *    (prefere o declarado se também bater), ou null se nenhum bater.
 *  - Erro ao consultar o Stripe        -> lança (500): o Stripe repete mais tarde.
 */
async function planoRealmentePago(session: any, declarado: string): Promise<string | null> {
  const configurados = PLANOS_PAGOS.filter((id) => !!process.env[`STRIPE_PRODUCT_${id}`]);
  if (configurados.length === 0) {
    console.warn('[webhook] STRIPE_PRODUCT_* não definidos — plano vindo da URL NÃO verificado');
    return declarado;
  }
  if (!stripe) throw new Error('Stripe not configured');

  const itens = await stripe.checkout.sessions.listLineItems(session.id, { limit: 20 });
  const pagos = itens.data
    .map((i: any) => (typeof i.price?.product === 'string' ? i.price.product : i.price?.product?.id))
    .filter(Boolean) as string[];

  const bate = (id: string) => pagos.includes(process.env[`STRIPE_PRODUCT_${id}`] as string);
  if (configurados.includes(declarado) && bate(declarado)) return declarado;
  return configurados.find(bate) ?? null;
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

  // Só planos pagos conhecidos. Antes, qualquer texto vindo da referência era
  // gravado tal e qual em subscription_tier.
  if (!SUBSCRIPTION_PLANS.some((p) => p.id === planId && p.id !== 'FREE')) {
    console.error(`[webhook] plano desconhecido "${planId}" para o membro ${userId} — ignorado`);
    return;
  }

  // Chemin A (Payment Link) : o plano veio de um parâmetro de URL que o próprio
  // membro pode editar. Quando os produtos Stripe estão configurados
  // (STRIPE_PRODUCT_<PLANO>), concede-se o plano REALMENTE pago.
  if (ref.includes('|')) {
    const pago = await planoRealmentePago(session, planId);
    if (!pago) {
      console.error(
        `[webhook] PAGAMENTO NÃO CORRESPONDE a nenhum plano configurado (sessão ${session.id}, membro ${userId}) — nada concedido`
      );
      return;
    }
    if (pago !== planId) {
      console.warn(`[webhook] referência pedia ${planId} mas o produto pago é ${pago} — concedido ${pago}`);
      planId = pago;
    }
  }

  // Facturation MENSUELLE récurrente : le premier paiement ne couvre qu'un
  // seul mois. Les renouvellements mensuels étendent `subscription_end` via
  // l'événement `invoice.paid` (voir handleInvoicePaid).
  const now = new Date();
  const subscriptionEnd = new Date(now);
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

  // Idempotence : Stripe re-envia el evento en caso de reintento — un replay
  // de `checkout.session.completed` no debe NUNCA acortar una suscripción
  // ya extendida por un `invoice.paid` posterior.
  const { data: previo } = await supabase
    .from('profiles')
    .select('subscription_start, subscription_end')
    .eq('id', userId)
    .maybeSingle();

  const fimAtual = previo?.subscription_end ? new Date(previo.subscription_end) : null;
  if (Number.isFinite(fimAtual?.getTime()) && fimAtual && fimAtual > subscriptionEnd) {
    subscriptionEnd.setTime(fimAtual.getTime());
  }
  // Preserva la fecha de inicio original del abono en los replays.
  const inicio = previo?.subscription_start ?? now.toISOString();

  // Mise à jour du profil (snake_case) — pas la table `users`.
  const { data: profileData, error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: planId,
      subscription_start: inicio,
      subscription_end: subscriptionEnd.toISOString(),
      stripe_customer_id: session.customer,
      updated_at: now.toISOString(),
    })
    .eq('id', userId)
    .select('email, username')
    .single();

  if (error) {
    // Perfil inexistente: repetir não ajuda. Qualquer outro erro (banco fora do
    // ar, chave inválida…) TEM de devolver 500 — com 200 o Stripe não repete e
    // o cliente fica a pagar sem receber o acesso.
    if (error.code === 'PGRST116') {
      console.error(`[webhook] membro ${userId} não existe em profiles — nada a ativar`);
      return;
    }
    console.error('Failed to update profile subscription:', error);
    throw new Error(`profiles update failed: ${error.message}`);
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
 * Anúncio (evento) pago: publica. Antes disto não existia — o cliente
 * pagava a publicação e ela ficava is_active=false para sempre
 * (activateEvent() em lib/events.ts não tinha chamador).
 * Recalcula expires_at a partir do momento do pagamento (o prazo de
 * exibição conta a partir do pagamento, não da criação).
 */
async function handleEventPaid(session: any) {
  const eventId = session.metadata.eventId;
  const planType = session.metadata.planType;

  if (!eventId) {
    console.error('checkout.session.completed de evento sem eventId — ignorado');
    return;
  }

  const duracaoDias =
    (EVENT_PLANS[planType as EventPlanType]?.duration as number | undefined) ?? 30;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + duracaoDias);

  const { data: evento, error } = await supabase
    .from('events')
    .update({
      is_active: true,
      payment_status: 'paid',
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select('id, title, user_id')
    .maybeSingle();

  if (error) {
    console.error('Failed to activate paid event:', error);
    return;
  }

  if (!evento) {
    console.error(`Evento pago ${eventId} não existe na BD — nada a ativar`);
    return;
  }

  console.log(`📢 Anúncio pago e ativado: ${evento.title} (${eventId})`);
  console.log('⚠️ RLS precisa permitir UPDATE por service_role em events');
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

  // Idem potência: só estende. Se a assinatura já vai até depois desta
  // fatura (ou o evento é replay de um mês antigo), não faz nada.
  const { data: atual } = await supabase
    .from('profiles')
    .select('subscription_end')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  const fimAtual = atual?.subscription_end ? new Date(atual.subscription_end) : null;
  if (Number.isFinite(fimAtual?.getTime()) && fimAtual && fimAtual >= subscriptionEnd) {
    console.log('invoice.paid já refletido — sem alteração');
    return;
  }

  const { data: renovees, error } = await supabase
    .from('profiles')
    .update({
      subscription_end: subscriptionEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)
    .select('email, username, subscription_tier');

  if (error) {
    console.error('Failed to extend subscription_end on invoice.paid:', error);
    throw new Error(`profiles update failed: ${error.message}`);
  }

  const renovee = Array.isArray(renovees) && renovees.length > 0 ? renovees[0] : null;
  console.log(`🔁 Abonnement renouvelé jusqu'au ${subscriptionEnd.toISOString()} (customer ${customerId})`);

  if (renovee?.email) {
    try {
      await sendAbonnementRenewalEmail(
        renovee.email,
        renovee.username,
        renovee.subscription_tier || 'PASS_EPICURIEN',
        subscriptionEnd
      );
    } catch (err) {
      console.error('Failed to send renewal email:', err);
    }
  }
}

/**
 * Paiement réussi : journalisation analytique.
 */
async function handleChargeSucceeded(charge: any) {
  console.log(`💰 Charge succeeded: ${charge.id} for customer ${charge.customer}`);
  try {
    // Idempotence: re-envoies do Stripe inseriam a mesma charge N vezes
    // (sem unique na coluna). Salta se já registada.
    const { data: jaLogada } = await supabase
      .from('payment_logs')
      .select('id')
      .eq('stripe_charge_id', charge.id)
      .limit(1);
    if (jaLogada && jaLogada.length > 0) return;

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
    throw new Error(`profiles update failed: ${error.message}`);
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