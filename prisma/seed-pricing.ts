/**
 * 💰 SEED DES FORMULES D'ABONNEMENT
 *
 * Remplit la table pricing_plans avec les trois formules réellement
 * vendues. Elles doivent rester alignées sur :
 *   - src/config/plans.ts  (ce qu'affichent /pricing et /abonnements)
 *   - src/lib/stripe.ts    (ce que le paiement accepte)
 *
 * Exécution :
 *   npx tsx prisma/seed-pricing.ts
 *
 * Le script est idempotent : il peut être relancé sans créer de doublons.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BENEFITS = [
  'Voir tous les profils (couples et célibataires)',
  'Créer et rejoindre des groupes de discussion',
  'Chat illimité en temps réel',
  'Filtres de recherche avancés',
  'Badge Premium sur votre profil',
]

const PRICING_DATA = [
  {
    name: 'PREMIUM_3M',
    displayName: 'Premium 3 mois',
    description: 'Accès complet pendant 3 mois, sans reconduction automatique.',
    priceEuro: 16,
    billingPeriod: 'quarterly',
    isPopular: false,
  },
  {
    name: 'PREMIUM_12M',
    displayName: 'Premium 1 an',
    description: "La formule la plus choisie : 12 mois d'accès complet.",
    priceEuro: 25,
    billingPeriod: 'yearly',
    isPopular: true,
  },
  {
    name: 'PREMIUM_24M',
    displayName: 'Premium 2 ans',
    description: "Le meilleur tarif au mois : 24 mois d'accès complet.",
    priceEuro: 70,
    billingPeriod: 'biennial',
    isPopular: false,
  },
]

async function main() {
  console.log('🌱 Seed des formules d’abonnement…')

  for (const plan of PRICING_DATA) {
    const data = {
      displayName: plan.displayName,
      description: plan.description,
      priceEuro: plan.priceEuro,
      billingPeriod: plan.billingPeriod,
      maxMessages: 9999,
      maxPhotos: 20,
      maxProfiles: 0,
      hasVideoCall: false,
      hasVoiceCall: false,
      hasAdvancedFilters: true,
      hasVerified: false,
      hasGallery: false,
      hasPriority: false,
      features: BENEFITS,
      isActive: true,
      isPopular: plan.isPopular,
    }

    await prisma.pricingPlan.upsert({
      where: { name: plan.name },
      update: data,
      create: { name: plan.name, ...data },
    })

    console.log(`  ✅ ${plan.displayName} — ${plan.priceEuro} €`)
  }

  console.log(`✨ Terminé : ${PRICING_DATA.length} formules à jour.`)
}

main()
  .catch((error) => {
    console.error('❌ Erreur pendant le seed :', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
