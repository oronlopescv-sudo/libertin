import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  PREMIUM_3M: {
    name: 'Premium 3 mois',
    priceEuro: 16,
    durationMonths: 3,
  },
  PREMIUM_12M: {
    name: 'Premium 1 an',
    priceEuro: 25,
    durationMonths: 12,
  },
  PREMIUM_24M: {
    name: 'Premium 2 ans',
    priceEuro: 70,
    durationMonths: 24,
  },
} as const

export type PlanTier = keyof typeof PLANS

export function isValidTier(tier: string): tier is PlanTier {
  return tier in PLANS
}
