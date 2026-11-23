import { NextResponse } from 'next/server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { createServiceRoleClient } from '@/lib/supabase';
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

  // 014: stripe_customer_id deixou de ser selecionável por membros
  // (REVOKE de colunas) — leitura agora usa a chave de serviço.
  const { data } = await createServiceRoleClient()
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', auth.user.id)
    .maybeSingle();

  // Tier obsoleto: quando o Premium expirou, o tier gravado na base
  // (e o título do plano) deixam de ser verdade — a UI mostraria
  // «Pass VIP» a um membro que já não paga. Só `premium` real conta.
  const ePremium = isPremium(auth.user);
  const tierVisual = ePremium ? (auth.user.subscriptionTier || 'FREE') : 'FREE';
  const plan = getPlanDetails(tierVisual as Parameters<typeof getPlanDetails>[0]);

  return NextResponse.json({
    subscriptionTier: tierVisual,
    subscriptionEnd: auth.user.subscriptionEnd,
    stripeCustomerId: data?.stripe_customer_id ?? null,
    planTitle: plan?.title ?? 'Compte Découverte',
    premium: ePremium,
  });
}