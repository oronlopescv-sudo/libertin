'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllPricingTiers, formatPrice } from '@/config/pricing'
import type { PricingTier } from '@/config/pricing'

/**
 * 💰 PÁGINA PÚBLICA DE PREÇOS
 * URL: /pricing
 * Clientes podem ver todos os planos e preços
 */

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch('/api/admin/pricing')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.sort((a: PricingTier, b: PricingTier) => a.priceEuro - b.priceEuro))
        } else {
          setPlans(getAllPricingTiers())
        }
      } catch {
        setPlans(getAllPricingTiers())
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 text-4xl">⌛</div>
          <p className="text-slate-600 dark:text-slate-400">Chargement des plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
          💰 Nos plans d&apos;abonnement
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Choisissez le plan qui convient le mieux à vos besoins et rejoignez des milliers de membres satisfaits
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 transition-all hover:shadow-2xl ${
                plan.isPopular
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 scale-105'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    ⭐ Plus populaire
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.displayName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 h-12">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {plan.priceEuro === 0 ? (
                      <span className="text-2xl">Gratuit</span>
                    ) : (
                      <>
                        <span>{formatPrice(plan.priceEuro, 'EUR')}</span>
                        <span className="text-lg text-slate-600 dark:text-slate-400">/mois</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                    Inclus dans ce plan:
                  </div>
                  
                  {/* Messages */}
                  <div className="flex items-start gap-3">
                    <span className={plan.maxMessages > 0 ? 'text-green-600' : 'text-slate-400'}>✓</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {plan.maxMessages === 9999
                        ? 'Messages illimités'
                        : plan.maxMessages === 10
                          ? '10 messages/jour'
                          : `${plan.maxMessages} messages`}
                    </span>
                  </div>

                  {/* Photos */}
                  <div className="flex items-start gap-3">
                    <span className={plan.maxPhotos > 0 ? 'text-green-600' : 'text-slate-400'}>✓</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {plan.maxPhotos} photos
                    </span>
                  </div>

                  {/* Video Call */}
                  <div className="flex items-start gap-3">
                    <span className={plan.hasVideoCall ? 'text-green-600' : 'text-slate-400'}>
                      {plan.hasVideoCall ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Vidéocall
                    </span>
                  </div>

                  {/* Voice Call */}
                  <div className="flex items-start gap-3">
                    <span className={plan.hasVoiceCall ? 'text-green-600' : 'text-slate-400'}>
                      {plan.hasVoiceCall ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Appels vocaux
                    </span>
                  </div>

                  {/* Advanced Filters */}
                  <div className="flex items-start gap-3">
                    <span className={plan.hasAdvancedFilters ? 'text-green-600' : 'text-slate-400'}>
                      {plan.hasAdvancedFilters ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Filtres avancés
                    </span>
                  </div>

                  {/* Verified */}
                  <div className="flex items-start gap-3">
                    <span className={plan.hasVerified ? 'text-green-600' : 'text-slate-400'}>
                      {plan.hasVerified ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Profil vérifié
                    </span>
                  </div>

                  {/* Gallery */}
                  <div className="flex items-start gap-3">
                    <span className={plan.hasGallery ? 'text-green-600' : 'text-slate-400'}>
                      {plan.hasGallery ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Galerie privée
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="flex items-start gap-3">
                    <span className={plan.hasPriority ? 'text-green-600' : 'text-slate-400'}>
                      {plan.hasPriority ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Support prioritaire
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={plan.name === 'FREE' ? '/register' : `/checkout?plan=${plan.name}`}
                  className={`block w-full py-3 px-4 rounded-lg font-bold text-center transition-all ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {plan.name === 'FREE' ? 'S&apos;inscrire gratuitement' : 'Choisir ce plan'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 py-20 border-t border-slate-200 dark:border-slate-700">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Comparaison détaillée des plans
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left py-4 px-4 font-bold text-slate-900 dark:text-white">Fonctionnalité</th>
                {plans.map((plan) => (
                  <th
                    key={plan.name}
                    className="py-4 px-4 font-bold text-center text-slate-900 dark:text-white"
                  >
                    {plan.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Messages */}
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Messages</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 px-4 text-center text-slate-600 dark:text-slate-400">
                    {plan.maxMessages === 9999 ? '∞' : plan.maxMessages}
                  </td>
                ))}
              </tr>

              {/* Photos */}
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Photos</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 px-4 text-center text-slate-600 dark:text-slate-400">
                    {plan.maxPhotos}
                  </td>
                ))}
              </tr>

              {/* Video Call */}
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Vidéocall</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 px-4 text-center">
                    <span className={plan.hasVideoCall ? 'text-green-600 text-lg' : 'text-slate-400 text-lg'}>
                      {plan.hasVideoCall ? '✓' : '✗'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Voice Call */}
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Appels vocaux</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 px-4 text-center">
                    <span className={plan.hasVoiceCall ? 'text-green-600 text-lg' : 'text-slate-400 text-lg'}>
                      {plan.hasVoiceCall ? '✓' : '✗'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Advanced Filters */}
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Filtres avancés</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 px-4 text-center">
                    <span className={plan.hasAdvancedFilters ? 'text-green-600 text-lg' : 'text-slate-400 text-lg'}>
                      {plan.hasAdvancedFilters ? '✓' : '✗'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Verified */}
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Profil vérifié</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 px-4 text-center">
                    <span className={plan.hasVerified ? 'text-green-600 text-lg' : 'text-slate-400 text-lg'}>
                      {plan.hasVerified ? '✓' : '✗'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Gallery */}
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Galerie privée</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 px-4 text-center">
                    <span className={plan.hasGallery ? 'text-green-600 text-lg' : 'text-slate-400 text-lg'}>
                      {plan.hasGallery ? '✓' : '✗'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Priority Support */}
              <tr>
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Support prioritaire</td>
                {plans.map((plan) => (
                  <td key={plan.name} className="py-4 px-4 text-center">
                    <span className={plan.hasPriority ? 'text-green-600 text-lg' : 'text-slate-400 text-lg'}>
                      {plan.hasPriority ? '✓' : '✗'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 py-20 border-t border-slate-200 dark:border-slate-700">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Questions fréquentes
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Puis-je changer de plan à tout moment?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Oui! Vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements s&apos;appliqueront immédiatement.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Comment se déroule la facturation?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Les abonnements payants sont facturés mensuellement. Vous recevrez une facture à chaque renouvellement.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Y a-t-il une période d&apos;essai gratuite?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Oui! Vous pouvez commencer gratuitement avec notre plan FREE et mettre à niveau ultérieurement.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Pouvez-vous annuler votre abonnement?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Bien sûr! Vous pouvez annuler à tout moment. Aucune question posée, aucune pénalité.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Prêt à rejoindre notre communauté?
        </h2>
        <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
          Créez votre compte gratuitement et commencez à rencontrer des gens extraordinaires aujourd&apos;hui.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:shadow-2xl transition-all hover:scale-105"
        >
          S&apos;inscrire maintenant →
        </Link>
      </div>
    </div>
  )
}
