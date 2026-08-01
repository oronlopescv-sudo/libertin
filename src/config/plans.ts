/**
 * Source unique de vérité des abonnements vendus sur le site.
 *
 * Les tarifs doivent rester alignés sur PLANS dans src/lib/stripe.ts :
 * c'est cette liste-là que /api/payments/create-checkout accepte. Annoncer
 * ici une formule absente de stripe.ts revient à afficher au visiteur un
 * plan impossible à acheter.
 */

export interface Plan {
  tier: 'PREMIUM_3M' | 'PREMIUM_12M' | 'PREMIUM_24M'
  name: string
  priceEuro: number
  durationMonths: number
  /** Prix ramené au mois, pour comparaison. */
  monthly: string
  highlighted: boolean
}

export const PLANS: Plan[] = [
  {
    tier: 'PREMIUM_3M',
    name: 'Premium 3 mois',
    priceEuro: 16,
    durationMonths: 3,
    monthly: '5,33€/mois',
    highlighted: false,
  },
  {
    tier: 'PREMIUM_12M',
    name: 'Premium 1 an',
    priceEuro: 25,
    durationMonths: 12,
    monthly: '2,08€/mois',
    highlighted: true,
  },
  {
    tier: 'PREMIUM_24M',
    name: 'Premium 2 ans',
    priceEuro: 70,
    durationMonths: 24,
    monthly: '2,92€/mois',
    highlighted: false,
  },
]

/** Avantages inclus dans toutes les formules Premium. */
export const BENEFITS: string[] = [
  'Voir tous les profils (couples et célibataires)',
  'Créer et rejoindre des groupes de discussion',
  'Chat illimité en temps réel',
  'Filtres de recherche avancés',
  'Badge Premium sur votre profil',
]

export function formatEuro(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}
