'use client'

import Link from 'next/link'
import { getAllPricingTiers, formatPrice } from '@/config/pricing'
import type { PricingTier } from '@/config/pricing'

/**
 * 💰 COMPONENTE DE COMPARAÇÃO DE PREÇOS
 * Pode ser usado em qualquer página para mostrar os planos
 * 
 * Exemplo de uso:
 * import { PricingComparison } from '@/components/pricing-comparison'
 * <PricingComparison />
 */

export function PricingComparison() {
  const plans = getAllPricingTiers()

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Choisissez votre plan
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tous les plans incluent l&apos;accès gratuit. Mettez à niveau pour débloquer plus de fonctionnalités.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                plan.isPopular
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 scale-105'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ⭐ Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Name */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.displayName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {plan.priceEuro === 0 ? (
                      <span>Gratuit</span>
                    ) : (
                      <>
                        {formatPrice(plan.priceEuro, 'EUR')}
                        <span className="text-sm text-slate-600 dark:text-slate-400">/mois</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Features */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className={plan.maxMessages > 0 ? 'text-green-600' : 'text-slate-400'}>
                    {plan.maxMessages === 9999 ? '∞' : plan.maxMessages} messages
                  </div>
                  <div className={plan.maxPhotos > 0 ? 'text-green-600' : 'text-slate-400'}>
                    {plan.maxPhotos} photos
                  </div>
                  <div className={plan.hasVideoCall ? 'text-green-600' : 'text-slate-400'}>
                    {plan.hasVideoCall ? '✓' : '✗'} Vidéocall
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.name === 'FREE' ? '/register' : `/checkout?plan=${plan.name}`}
                  className={`block w-full py-2 px-3 rounded-lg font-bold text-center transition-all text-sm ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
                  }`}
                >
                  {plan.name === 'FREE' ? 'Commencer' : 'Choisir'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Pricing */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-block text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            Voir la comparaison complète des plans →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PricingComparison
