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
  PREMIUM_3M: process.env.STRIPE_PRODUCT_PREMIUM_3M || 'prod_3m_placeholder',
  PREMIUM_12M: process.env.STRIPE_PRODUCT_PREMIUM_12M || 'prod_12m_placeholder',
  PREMIUM_24M: process.env.STRIPE_PRODUCT_PREMIUM_24M || 'prod_24m_placeholder',
  CREATOR_3M: process.env.STRIPE_PRODUCT_CREATOR_3M || 'prod_creator_3m_placeholder',
  CREATOR_12M: process.env.STRIPE_PRODUCT_CREATOR_12M || 'prod_creator_12m_placeholder',
  VIP_24M: process.env.STRIPE_PRODUCT_VIP_24M || 'prod_vip_24m_placeholder',
};

export const SUBSCRIPTION_PLANS: AbonnementPlan[] = [
  {
    id: 'FREE',
    title: 'Compte Découverte',
    durationMonths: 0,
    totalPrice: 0,
    pricePerMonth: 0,
    savings: '100% Gratuit',
    features: [
      'Création de profil libertin annyme',
      'Accès aux groupes en mode lecture',
      'Envoi de photos de vérification',
      'Support par email en Français',
    ],
  },
  {
    id: 'PREMIUM_3M',
    title: 'Pass Épicurien 3 Mois',
    durationMonths: 3,
    totalPrice: 24,
    pricePerMonth: 8.00,
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
    id: 'PREMIUM_12M',
    title: 'Pass Privilège 12 Mois',
    durationMonths: 12,
    totalPrice: 70,
    pricePerMonth: 5.83,
    popular: true,
    savings: 'LE PLUS CHOISI (-27%)',
    features: [
      'Toutes les fonctionnalités Premium 3M',
      'Création illimitée de groupes de soirées & clubs',
      'Priorité absolue sur la modération & vérification',
      'Visibilité prioritaire dans l\'onglet Découvrir',
      'Mode Fantôme (visites de profil 100% invisibles)',
      'Invitation exclusive aux soirées privées partenaire',
    ],
  },
  {
    id: 'PREMIUM_24M',
    title: 'Pass VIP Elite 24 Mois',
    durationMonths: 24,
    totalPrice: 110,
    pricePerMonth: 4.58,
    savings: 'Le meilleur tarif mensuel (-43%)',
    features: [
      'Toutes les fonctionnalités Privilège 12M',
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
