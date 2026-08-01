/**
 * 💰 PRICING SEED - Insere os planos de preço no banco de dados
 * 
 * Execute com:
 * npx ts-node prisma/seed-pricing.ts
 * 
 * Ou adicione ao package.json:
 * "seed": "node prisma/seed-pricing.ts"
 * 
 * E execute:
 * npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PRICING_DATA = [
  {
    name: 'FREE',
    displayName: 'Explorador',
    description: 'Perfeito para começar',
    priceEuro: 0,
    priceDolar: 0,
    priceCve: 0,
    billingPeriod: 'monthly',
    maxMessages: 10,
    maxPhotos: 3,
    maxProfiles: 0,
    hasVideoCall: false,
    hasVoiceCall: false,
    hasAdvancedFilters: false,
    hasVerified: false,
    hasGallery: false,
    hasPriority: false,
    features: [
      '✓ Criação de perfil básico',
      '✓ 10 mensagens/dia',
      '✓ Procura simples',
      '✓ Ver fotos de perfil',
    ],
    isActive: true,
    isPopular: false,
  },
  {
    name: 'STARTER',
    displayName: 'Premium',
    description: 'Para conexões sérias',
    priceEuro: 9.99,
    priceDolar: 10.99,
    priceCve: 1050,
    billingPeriod: 'monthly',
    maxMessages: 500,
    maxPhotos: 15,
    maxProfiles: 0,
    hasVideoCall: false,
    hasVoiceCall: false,
    hasAdvancedFilters: true,
    hasVerified: false,
    hasGallery: false,
    hasPriority: false,
    features: [
      '✓ Perfil completo',
      '✓ Mensagens ilimitadas',
      '✓ Chat em tempo real',
      '✓ Ver quem gostou de você',
      '✓ Filtros avançados',
      '✓ Sem anúncios',
    ],
    isActive: true,
    isPopular: false,
  },
  {
    name: 'PRO',
    displayName: 'VIP',
    description: 'Experiência completa',
    priceEuro: 29.99,
    priceDolar: 32.99,
    priceCve: 3150,
    billingPeriod: 'monthly',
    maxMessages: 9999,
    maxPhotos: 50,
    maxProfiles: 0,
    hasVideoCall: true,
    hasVoiceCall: true,
    hasAdvancedFilters: true,
    hasVerified: true,
    hasGallery: true,
    hasPriority: true,
    features: [
      '✓ Tudo no Premium +',
      '✓ Destaque no feed',
      '✓ Prioridade no suporte',
      '✓ Galerias privadas',
      '✓ Cupom 20% desconto',
      '✓ Acesso antecipado',
    ],
    isActive: true,
    isPopular: true,
  },
  {
    name: 'BUSINESS',
    displayName: 'Elite',
    description: 'Para os mais exigentes',
    priceEuro: 99.99,
    priceDolar: 109.99,
    priceCve: 10500,
    billingPeriod: 'monthly',
    maxMessages: 9999,
    maxPhotos: 100,
    maxProfiles: 0,
    hasVideoCall: true,
    hasVoiceCall: true,
    hasAdvancedFilters: true,
    hasVerified: true,
    hasGallery: true,
    hasPriority: true,
    features: [
      '✓ Tudo no VIP +',
      '✓ Account manager dedicado',
      '✓ Suporte 24/7 prioritário',
      '✓ Analytics avançados',
      '✓ Disconto 30% anual',
      '✓ Verificação com rush',
    ],
    isActive: true,
    isPopular: false,
  },
  {
    name: 'VIP',
    displayName: 'Libertine Master',
    description: 'Status supremo',
    priceEuro: 199.99,
    priceDolar: 219.99,
    priceCve: 21000,
    billingPeriod: 'monthly',
    maxMessages: 9999,
    maxPhotos: 200,
    maxProfiles: 0,
    hasVideoCall: true,
    hasVoiceCall: true,
    hasAdvancedFilters: true,
    hasVerified: true,
    hasGallery: true,
    hasPriority: true,
    features: [
      '✓ Tudo no Elite +',
      '✓ Badge VIP exclusivo',
      '✓ Concierge pessoal',
      '✓ Acesso VIP eventos',
      '✓ Lifetime benefits',
      '✓ Customização total',
    ],
    isActive: true,
    isPopular: false,
  },
]

async function main() {
  console.log('🌱 Iniciando seed de preços...')

  try {
    // Limpar dados existentes
    console.log('🗑️  Limpando planos existentes...')
    await prisma.pricingPlan.deleteMany({})

    // Inserir novos planos
    console.log('💰 Inserindo novos planos de preço...')
    for (const plan of PRICING_DATA) {
      await prisma.pricingPlan.create({
        data: {
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          priceEuro: plan.priceEuro,
          priceDolar: plan.priceDolar,
          priceCve: plan.priceCve,
          billingPeriod: plan.billingPeriod,
          maxMessages: plan.maxMessages,
          maxPhotos: plan.maxPhotos,
          maxProfiles: plan.maxProfiles,
          hasVideoCall: plan.hasVideoCall,
          hasVoiceCall: plan.hasVoiceCall,
          hasAdvancedFilters: plan.hasAdvancedFilters,
          hasVerified: plan.hasVerified,
          hasGallery: plan.hasGallery,
          hasPriority: plan.hasPriority,
          features: JSON.stringify(plan.features),
          isActive: plan.isActive,
          isPopular: plan.isPopular,
        },
      })
      console.log(`  ✅ ${plan.displayName} (${plan.name})`)
    }

    console.log('✨ Seed de preços concluído com sucesso!')
    console.log(`📊 Total de planos: ${PRICING_DATA.length}`)
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
