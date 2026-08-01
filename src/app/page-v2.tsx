'use client'

import React from 'react'
import HeroSectionV2 from '@/components/hero-section-v2'
import FeaturesV2 from '@/components/features-v2'
import PricingV2 from '@/components/pricing-v2'
import CTAV2 from '@/components/cta-v2'

/**
 * 🎨 LIBERTINELOVER - HOME PAGE V2
 * Design completamente melhorado com componentes modernos
 * 
 * Para ativar esta página:
 * 1. Faça backup de src/app/page.tsx
 * 2. Renomeie esta arquivo para src/app/page.tsx
 * 3. Faça npm run build
 * 4. Deploy!
 */

export default function HomeV2() {
  return (
    <main className="bg-slate-950">
      {/* Hero Section */}
      <HeroSectionV2 />

      {/* Features Section */}
      <FeaturesV2 />

      {/* Pricing Section */}
      <PricingV2 />

      {/* CTA Section */}
      <CTAV2 />

      {/* Footer será renderizado automaticamente */}
    </main>
  )
}
