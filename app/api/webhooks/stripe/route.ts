import { handleStripeWebhook } from '@/lib/stripe-webhook';

/**
 * Alias du webhook Stripe (ancien chemin). Même gestionnaire que
 * /api/payments/webhook pour ne casser aucun endpoint configuré.
 */
export const POST = handleStripeWebhook;