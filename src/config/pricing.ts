/**
 * 💰 PRICING CONFIGURATION - Libertinelover
 * Configuração centralizada de todos os planos de preço
 */

export interface PricingTier {
  id: string
  name: string
  displayName: string
  description: string
  priceEuro: number
  priceDolar?: number
  priceCve?: number
  billingPeriod: 'monthly' | 'yearly' | 'lifetime'
  
  // Limites
  maxMessages: number
  maxPhotos: number
  maxProfiles: number
  
  // Features booleanas
  hasVideoCall: boolean
  hasVoiceCall: boolean
  hasAdvancedFilters: boolean
  hasVerified: boolean
  hasGallery: boolean
  hasPriority: boolean
  
  // Features em array
  features: string[]
  
  // UI
  isPopular: boolean
  badge?: string
  
  // Stripe
  stripeProductId?: string
}

/**
 * PLANOS DISPONÍVEIS
 */
export const PRICING_TIERS: Record<string, PricingTier> = {
  FREE: {
    id: 'free',
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
      '✗ Chat em tempo real',
      '✗ Filtros avançados',
    ],
    
    isPopular: false,
  },

  STARTER: {
    id: 'starter',
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
    
    isPopular: false,
    badge: 'Popular',
  },

  PRO: {
    id: 'pro',
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
    
    isPopular: true,
    badge: 'Mais Popular',
  },

  BUSINESS: {
    id: 'business',
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
    
    isPopular: false,
    badge: 'Elite',
  },

  VIP: {
    id: 'vip',
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
    
    isPopular: false,
    badge: 'Libertine Master',
  },
}

/**
 * HELPER FUNCTIONS
 */

export const getPricingTier = (tierName: string): PricingTier | null => {
  return PRICING_TIERS[tierName] || null
}

export const getAllPricingTiers = (): PricingTier[] => {
  return Object.values(PRICING_TIERS)
}

export const getActivePricingTiers = (): PricingTier[] => {
  return getAllPricingTiers().filter(tier => tier.priceEuro >= 0)
}

export const convertPrice = (
  priceEuro: number,
  targetCurrency: 'usd' | 'cve' = 'usd'
): number => {
  // Taxas de câmbio aproximadas
  const exchangeRates = {
    usd: 1.1, // 1 EUR = 1.1 USD
    cve: 110, // 1 EUR = 110 CVE
  }
  
  return Number((priceEuro * exchangeRates[targetCurrency]).toFixed(2))
}

export const formatPrice = (price: number, currency: 'EUR' | 'USD' | 'CVE' = 'EUR'): string => {
  const currencySymbols = {
    EUR: '€',
    USD: '$',
    CVE: '$',
  }
  
  const symbol = currencySymbols[currency]
  
  if (price === 0) return 'Grátis'
  
  return `${symbol}${price.toFixed(2)}`
}

/**
 * FEATURES POR TIER
 */
export const getFeaturesByTier = (tierName: string): string[] => {
  const tier = getPricingTier(tierName)
  return tier?.features || []
}

export const hasFeature = (tierName: string, feature: string): boolean => {
  const tier = getPricingTier(tierName)
  if (!tier) return false
  
  const featureMap: Record<string, keyof PricingTier> = {
    'video_call': 'hasVideoCall',
    'voice_call': 'hasVoiceCall',
    'advanced_filters': 'hasAdvancedFilters',
    'verified': 'hasVerified',
    'gallery': 'hasGallery',
    'priority': 'hasPriority',
  }
  
  const tierKey = featureMap[feature]
  if (!tierKey) return tier.features.some(f => f.includes(feature))
  
  return tier[tierKey] as boolean
}

/**
 * LIMITES POR TIER
 */
export const getMessageLimit = (tierName: string): number => {
  return getPricingTier(tierName)?.maxMessages || 0
}

export const getPhotoLimit = (tierName: string): number => {
  return getPricingTier(tierName)?.maxPhotos || 0
}

/**
 * COMPARAÇÃO ENTRE TIERS
 */
export const compareTiers = (tier1: string, tier2: string): boolean => {
  const tiers = Object.keys(PRICING_TIERS)
  return tiers.indexOf(tier1) <= tiers.indexOf(tier2)
}

/**
 * MIGRATION DATA
 */
export const PRICING_MIGRATION_DATA = Object.entries(PRICING_TIERS).map(([key, tier]) => ({
  name: tier.name,
  displayName: tier.displayName,
  description: tier.description,
  priceEuro: tier.priceEuro,
  priceDolar: tier.priceDolar,
  priceCve: tier.priceCve,
  billingPeriod: tier.billingPeriod,
  maxMessages: tier.maxMessages,
  maxPhotos: tier.maxPhotos,
  maxProfiles: tier.maxProfiles,
  hasVideoCall: tier.hasVideoCall,
  hasVoiceCall: tier.hasVoiceCall,
  hasAdvancedFilters: tier.hasAdvancedFilters,
  hasVerified: tier.hasVerified,
  hasGallery: tier.hasGallery,
  hasPriority: tier.hasPriority,
  features: JSON.stringify(tier.features),
  isActive: true,
  isPopular: tier.isPopular,
  stripeProductId: tier.stripeProductId || null,
}))
