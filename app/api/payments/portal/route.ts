import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Ouvre une session du portail de facturation Stripe (page hébergée par Stripe).
 *
 * Le membre peut y consulter ses factures passées et mettre à jour son moyen
 * de paiement. L'activation initiale, elle, se fait via /api/payments/create-checkout.
 *
 * Nécessite un `stripe_customer_id` déjà enregistré sur le profil (créé lors du
 * premier passage par checkout). Sans cela, il n'y a rien à gérer.
 */
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe non configuré sur le serveur.' },
      { status: 501 }
    );
  }

  const auth = await utilisateurActuel();
  if (!auth.ok) return auth.reponse;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', auth.user.id)
    .single();

  const customerId = data?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json(
      { error: "Aucune facturation Stripe n'est liée à ce compte." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://xlibertine.com';
  const body = await req.json().catch(() => ({}));
  // On n'accepte qu'un chemin relatif interne (commence par / mais pas par //)
  // pour éviter une redirection ouverte vers un domaine arbitraire.
  const returnUrl =
    typeof body.returnUrl === 'string' && /^\/[^/]/.test(body.returnUrl)
      ? `${baseUrl}${body.returnUrl}`
      : `${baseUrl}/abonnements`;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[billing-portal]', err);
    return NextResponse.json(
      {
        error: "Impossible d'ouvrir le portail de facturation.",
        message: err?.message || 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}