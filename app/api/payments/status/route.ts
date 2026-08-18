import { NextResponse } from 'next/server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getPlanDetails } from '@/lib/stripe';
import { isPremium } from '@/lib/premium';

/**
 * État de l'abonnement du membre connecté.
 *
 * Renvoie le tier courant, la date de fin, le titre du plan et — surtout —
 * la présence d'un `stripe_customer_id` qui indique si le portail de
 * facturation Stripe est utilisable. La page /abonnements s'en sert pour
 * décider d'afficher le bouton « Gérer ma facturation ».
 */
export async function GET() {
  const auth = await utilisateurActuel();
  if (!auth.ok) return auth.reponse;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', auth.user.id)
    .single();

  const tier = (auth.user.subscriptionTier || 'FREE') as Parameters<typeof getPlanDetails>[0];
  const plan = getPlanDetails(tier);

  return NextResponse.json({
    subscriptionTier: auth.user.subscriptionTier || 'FREE',
    subscriptionEnd: auth.user.subscriptionEnd,
    stripeCustomerId: data?.stripe_customer_id ?? null,
    planTitle: plan?.title ?? 'Compte Découverte',
    premium: isPremium(auth.user),
  });
}