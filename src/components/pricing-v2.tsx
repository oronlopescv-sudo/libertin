'use client'

import React from 'react'
import Link from 'next/link'

const PricingV2 = React.memo(() => {
  const plans = [
    {
      name: 'Explorateur',
      price: '0',
      description: 'Parfait pour commencer',
      features: [
        '✓ Création d\'un profil de base',
        '✓ 10 messages par jour',
        '✓ Recherche simple',
        '✓ Voir les photos de profil',
        '✗ Chat en temps réel',
        '✗ Filtres avancés',
      ],
      cta: 'Commencer gratuitement',
      badge: false
    },
    {
      name: 'Premium',
      price: '9,99',
      period: '/mois',
      description: 'Pour des rencontres sérieuses',
      features: [
        '✓ Profil complet',
        '✓ Messages illimités',
        '✓ Chat en temps réel',
        '✓ Voir qui vous a aimé',
        '✓ Filtres avancés',
        '✓ Appel vidéo',
      ],
      cta: 'Passer au Premium',
      badge: 'Le plus choisi'
    },
    {
      name: 'VIP',
      price: '29,99',
      period: '/mois',
      description: 'L\'expérience complète',
      features: [
        '✓ Tout le Premium, et plus',
        '✓ Mise en avant de votre profil',
        '✓ Support prioritaire',
        '✓ Galeries privées',
        '✓ 20 % de réduction',
        '✓ Accès anticipé',
      ],
      cta: 'Devenir VIP',
      badge: 'Exclusif'
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Des tarifs transparents
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Sans surprise
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Choisissez la formule qui correspond le mieux à votre rythme
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.badge
                  ? 'md:scale-105 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/30'
                  : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-black text-white">
                    €{plan.price}
                  </span>
                  {plan.period && <span className="text-slate-400 ml-2">{plan.period}</span>}
                </div>

                {/* CTA Button */}
                <Link
                  href={`/register?plan=${plan.name.toLowerCase()}`}
                  className={`w-full py-3 rounded-xl font-bold text-center transition-all duration-300 mb-8 block ${
                    plan.badge
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Features List */}
                <div className="space-y-3 border-t border-slate-700/50 pt-8">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="text-sm text-slate-300">
                      {feature.includes('✓') ? (
                        <span className="text-green-400">{feature}</span>
                      ) : (
                        <span className="text-slate-500">{feature}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16">
          <p className="text-slate-400">
            Todos os planos incluem garantia de satisfação de 7 dias
          </p>
        </div>
      </div>
    </section>
  )
})

PricingV2.displayName = 'PricingV2'

export default PricingV2
