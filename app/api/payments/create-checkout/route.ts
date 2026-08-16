import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { utilisateurActuel } from '@/lib/auth-serveur';

/**
 * Crée une session de paiement Stripe Checkout (page hébergée par Stripe).
 *
 * Utilise price_data dynamique plutôt que des Price ID pré-créés dans le
 * tableau de bord Stripe : fonctionne immédiatement avec les prix définis
 * dans lib/stripe.ts, sans étape de configuration manuelle côté Stripe.
 */
export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        {
          error: 'Passerelle de paiement non configurée.',
          message: "La variable STRIPE_SECRET_KEY n'est pas définie sur le serveur.",
        },
        { status: 501 }
      );
    }

    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const body = await req.json().catch(() => ({}));
    const tier = typeof body.tier === 'string' ? body.tier : '';

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === tier);
    if (!plan || plan.id === 'FREE') {
      return NextResponse.json({ error: "Plan d'abonnement invalide" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xlibertine.com';

    // Récupère ou crée le client Stripe associé au compte, pour que les
    // paiements futurs et le tableau de bord propriétaire puissent
    // retrouver qui a payé.
    let customerId = auth.user.email
      ? (
          await supabase
            .from('users')
            .select('stripeCustomerId')
            .eq('id', auth.user.id)
            .single()
        ).data?.stripeCustomerId
      : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.user.email ?? undefined,
        metadata: { userId: auth.user.id },
      });
      customerId = customer.id;
      await supabase
        .from('users')
        .update({ stripeCustomerId: customerId })
        .eq('id', auth.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: auth.user.id,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.title,
              description: `Abonnement xlibertine — ${plan.durationMonths} mois`,
            },
            unit_amount: Math.round(plan.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: auth.user.id,
        planId: plan.id,
        durationMonths: String(plan.durationMonths),
      },
      success_url: `${baseUrl}/abonnements?paiement=succes`,
      cancel_url: `${baseUrl}/abonnements?paiement=annule`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[create-checkout]', err);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
