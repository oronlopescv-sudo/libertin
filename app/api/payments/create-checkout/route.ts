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

    // Chemin A — Stripe Payment Link (lien hébergé par Stripe).
    // Si un lien de paiement est configuré pour ce tier (env STRIPE_LINK_<TIER>),
    // on redirige directement dessus : aucune clé secrète Stripe n'est requise,
    // aucun appel API serveur. Idéal si vous n'avez que des Payment Links.
    const lienPaiement = process.env[`STRIPE_LINK_${tier}`];
    if (lienPaiement && /^https?:\/\//.test(lienPaiement)) {
      return NextResponse.json({ url: lienPaiement });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xlibertine.com';

    // Récupère ou crée le client Stripe associé au compte, pour que les
    // paiements futurs et le tableau de bord propriétaire puissent
    // retrouver qui a payé. Lu/écrit dans `profiles` (snake_case).
    let customerId = auth.user.email
      ? (
          await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', auth.user.id)
            .single()
        ).data?.stripe_customer_id
      : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.user.email ?? undefined,
        metadata: { userId: auth.user.id },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
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
  } catch (err: any) {
    // Remonter la vraie cause Stripe (clé invalide, mode test/live, montant
    // refusé...). Sans cela, l'utilisateur ne voit qu'un message générique et
    // le diagnostic devient impossible.
    const type = err?.type || err?.name || 'Erreur';
    const message = err?.message || 'Erreur inconnue';
    const code = err?.code ? ` [${err.code}]` : '';
    console.error('[create-checkout]', type, message, err);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création de la session de paiement',
        message: `${type}${code}: ${message}`,
      },
      { status: 500 }
    );
  }
}
