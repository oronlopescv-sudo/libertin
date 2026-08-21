import Stripe from 'stripe';
import { AbonnementPlan, AbonnementTier } from './types';

/**
 * Initialize Stripe for server-side operations
 * STRIPE_SECRET_KEY must be set in environment
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

/**
 * Stripe Product IDs mapped to abonnement tiers
 * These must be created in Stripe Dashboard first
 */
export const STRIPE_PRODUCT_IDS: Record<AbonnementTier, string | null> = {
  FREE: null, // No Stripe product for free tier
  PASS_EPICURIEN: process.env.STRIPE_PRODUCT_PASS_EPICURIEN || 'prod_epicurien_placeholder',
  PASS_PRIVILEGE: process.env.STRIPE_PRODUCT_PASS_PRIVILEGE || 'prod_privilege_placeholder',
  PASS_VIP: process.env.STRIPE_PRODUCT_PASS_VIP || 'prod_vip_placeholder',
};

/**
 * Plans d'abonnement — facturation MENSUELLE RÉCURRENTE, sans durée fixe.
 *
 * `pricePerMonth` est le montant réellement prélevé chaque mois (affiché en
 * grand et envoyé à Stripe). `totalPrice` vaut `pricePerMonth` (un seul mois)
 * et n'est plus qu'un résidu du modèle ancien; `durationMonths` vaut 0 pour
 * tous les plans payants : l'abonnement est mensuel tant qu'il n'est pas
 * annulé. Les IDs PASS_EPICURIEN / PASS_PRIVILEGE / PASS_VIP sont les clés
 * internes stables (DB, Stripe, env). Aucune notion de durée.
 */
export const SUBSCRIPTION_PLANS: AbonnementPlan[] = [
  {
    id: 'FREE',
    title: 'Compte Découverte',
    durationMonths: 0,
    totalPrice: 0,
    pricePerMonth: 0,
    savings: '100% Gratuit',
    features: [
      'Création de profil libertin anonyme',
      'Accès aux groupes en mode lecture',
      'Envoi de photos de vérification',
      'Support par email en Français',
    ],
  },
  {
    id: 'PASS_EPICURIEN',
    title: 'Pass Épicurien',
    durationMonths: 0,
    totalPrice: 9,
    pricePerMonth: 9.00,
    savings: 'Sans engagement',
    features: [
      'Accès illimité à tous les profils vérifiés',
      'Tchat privé & envoi de messages dans les groupes',
      'Filtres de recherche géolocalisés avancés (GPS)',
      'Accès aux albums photos privés',
      'Badge Membre Vérifié mis en valeur',
    ],
  },
  {
    id: 'PASS_PRIVILEGE',
    title: 'Pass Privilège',
    durationMonths: 0,
    totalPrice: 15,
    pricePerMonth: 15.00,
    popular: true,
    savings: 'LE PLUS CHOISI',
    features: [
      'Toutes les fonctionnalités Pass Épicurien',
      'Création illimitée de groupes de soirées & clubs',
      'Priorité absolue sur la modération & vérification',
      'Visibilité prioritaire dans l\'onglet Découvrir',
      'Mode Fantôme (visites de profil 100% invisibles)',
      'Invitation exclusive aux soirées privées partenaire',
    ],
  },
  {
    id: 'PASS_VIP',
    title: 'Pass VIP Elite',
    durationMonths: 0,
    totalPrice: 25,
    pricePerMonth: 25.00,
    savings: 'Statut VIP Or permanent',
    features: [
      'Toutes les fonctionnalités Pass Privilège',
      'Statut VIP Or permanent sur la communauté',
      'Conseiller libertin dédié pour vos sorties',
      'Aucune publicité & aucune restriction d\'envoi',
    ],
  },
];

export function getPlanDetails(tier: AbonnementTier): AbonnementPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === tier) || SUBSCRIPTION_PLANS[0];
}

/**
 * Calculates end date based on duration in months
 */
export function calculateAbonnementEndDate(startDate: Date, durationMonths: number): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  return endDate;
}

/**
 * Create a Stripe Checkout session for abonnement upgrade
 * @param userId - User's unique identifier
 * @param planId - Abonnement tier ID
 * @param userEmail - User's email
 * @param successUrl - URL to redirect on success
 * @param cancelUrl - URL to redirect on cancel
 */
export async function createCheckoutSession(
  userId: string,
  planId: AbonnementTier,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    throw new Error('Stripe not configured. Set STRIPE_SECRET_KEY in environment.');
  }

  if (planId === 'FREE') {
    throw new Error('Cannot checkout FREE tier. This should be automatic.');
  }

  const priceId = STRIPE_PRODUCT_IDS[planId];
  if (!priceId || priceId.includes('placeholder')) {
    throw new Error(`Stripe price ID not configured for ${planId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: {
      userId,
      planId,
    },
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 * @param body - Raw request body
 * @param signature - Stripe-Signature header value
 */
export function verifyWebhookSignature(body: string, signature: string) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not set');
  }

  return stripe.webhooks.constructEvent(body, signature, secret);
}

/**
 * Get Stripe customer by ID or create new
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  // Search for existing customer by email
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer.id;
}
