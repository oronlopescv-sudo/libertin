'use client'

import Link from 'next/link'

export function SubscriptionPlans() {
  const plans = [
    {
      tier: 'FEMMES_COUPLES',
      name: 'Femmes & Couples',
      price: 0,
      period: 'Gratuit pour toujours',
      badge: '💚 100% GRATUIT',
      features: [
        '✓ Voir tous les profils',
        '✓ Créer et rejoindre des groupes',
        '✓ Chat illimité',
        '✓ Tous les filtres de recherche',
        '✓ Aucun paiement, jamais',
      ],
      cta: "Je m'inscris gratuitement",
      ctaHref: '/register?gender=femme',
      highlighted: false,
      green: true,
    },
    {
      tier: 'PREMIUM_3M',
      name: 'Hommes — 3 mois',
      price: 16,
      period: 'paiement unique',
      badge: null,
      features: [
        '✓ Voir tous les profils',
        '✓ Accès groupes et chat',
        '✓ Filtres géolocalisation',
        '✓ soit 5,33€/mois',
      ],
      cta: 'Activer Premium',
      ctaHref: '/register?gender=homme',
      highlighted: false,
      green: false,
    },
    {
      tier: 'PREMIUM_12M',
      name: 'Hommes — 1 an',
      price: 25,
      period: 'paiement annuel',
      badge: '⭐ MEILLEUR RAPPORT',
      features: [
        '✓ Tous les avantages Premium',
        '✓ Économisez 39€ vs 3 mois',
        '✓ soit 2,08€/mois',
        '✓ Support prioritaire',
      ],
      cta: 'Activer Premium 1 an',
      ctaHref: '/register?gender=homme',
      highlighted: true,
      green: false,
    },
    {
      tier: 'PREMIUM_24M',
      name: 'Hommes — 2 ans',
      price: 70,
      period: 'paiement biennal',
      badge: null,
      features: [
        '✓ Tous les avantages Premium',
        '✓ Tranquillité 24 mois',
        '✓ soit 2,92€/mois',
        '✓ Support VIP',
      ],
      cta: 'Activer Premium 2 ans',
      ctaHref: '/register?gender=homme',
      highlighted: false,
      green: false,
    },
  ]

  return (
    <div id="plans">
      <p className="text-center text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
        Notre modèle garantit une proportion unique de femmes et de couples : l&apos;accès est{' '}
        <strong className="text-green-600">entièrement gratuit pour elles</strong>, et les
        hommes contribuent via un abonnement Premium à prix unique.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`rounded-2xl border p-6 md:p-8 transition-all flex flex-col ${
              plan.green
                ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30'
                : plan.highlighted
                ? 'border-primary-300 dark:border-primary-700 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 shadow-elevated md:scale-105'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            {plan.badge && (
              <div
                className={`mb-4 self-start px-3 py-1 text-white text-xs font-bold rounded-full ${
                  plan.green ? 'bg-green-600' : 'bg-primary-600'
                }`}
              >
                {plan.badge}
              </div>
            )}

            <h3 className="text-xl font-bold font-heading mb-2 text-slate-900 dark:text-slate-100">
              {plan.name}
            </h3>

            <div className="mb-6">
              {plan.price > 0 ? (
                <>
                  <span
                    className={`text-4xl font-bold ${
                      plan.green ? 'text-green-600' : 'text-primary-600'
                    }`}
                  >
                    {plan.price}€
                  </span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{plan.period}</p>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold text-green-600">0€</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{plan.period}</p>
                </>
              )}
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={plan.ctaHref}
              className={`block w-full px-4 py-3 font-bold rounded-lg text-center transition-all text-sm ${
                plan.green
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : plan.highlighted
                  ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-elevated'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {plan.cta}
            </Link>

            {plan.price > 0 && (
              <p className="text-xs text-slate-500 text-center mt-3">
                💳 Paiement sécurisé Stripe
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
