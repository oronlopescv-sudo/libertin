import { handleStripeWebhook } from '@/lib/stripe-webhook';

/**
 * Webhook Stripe — point d'entrée principal configuré dans le tableau de bord
 * Stripe. Délègue à lib/stripe-webhook.ts qui met à jour `profiles` (snake_case)
 * et accorde réellement l'abonnement Premium après paiement.
 */
export const POST = handleStripeWebhook;