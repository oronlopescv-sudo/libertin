'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

const plans = [
  {
    tier: 'PREMIUM_3M',
    name: 'Premium 3 mois',
    price: 16,
    monthly: '5,33€/mois',
    highlighted: false,
  },
  {
    tier: 'PREMIUM_12M',
    name: 'Premium 1 an',
    price: 25,
    monthly: '2,08€/mois',
    highlighted: true,
  },
  {
    tier: 'PREMIUM_24M',
    name: 'Premium 2 ans',
    price: 70,
    monthly: '2,92€/mois',
    highlighted: false,
  },
]

const benefits = [
  'Voir tous les profils (couples et célibataires)',
  'Créer et rejoindre des groupes de discussion',
  'Chat illimité en temps réel',
  'Filtres de recherche avancés',
  'Badge Premium sur votre profil',
]

export default function AbonnementsPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const success = searchParams.get('success')
  const cancelled = searchParams.get('cancelled')

  const subscriptionEnd = session?.user?.subscriptionEnd
    ? new Date(session.user.subscriptionEnd)
    : null
  const isPremium = subscriptionEnd && subscriptionEnd > new Date()
  const isFreeAccess =
    session?.user?.gender === 'femme' || session?.user?.gender === 'couple'

  const handleCheckout = async (tier: string) => {
    setLoading(tier)
    setError('')
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la création du paiement')
        return
      }

      window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary-900 dark:text-primary-100 mb-2">
          Abonnement
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Un seul paiement, aucun prélèvement caché
        </p>
      </div>

      {/* Messages de retour Stripe */}
      {success && (
        <div className="alert alert-success mb-6">
          🎉 Paiement confirmé ! Votre abonnement Premium est actif. Reconnectez-vous si le
          statut ne s&apos;affiche pas immédiatement.
        </div>
      )}
      {cancelled && (
        <div className="alert alert-warning mb-6">
          Le paiement a été annulé. Aucun montant n&apos;a été débité.
        </div>
      )}
      {error && <div className="alert alert-danger mb-6">{error}</div>}

      {/* Statut actuel */}
      <div className="card mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Statut actuel</p>
            {isPremium ? (
              <>
                <p className="text-xl font-bold text-primary-600">⭐ Premium actif</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Valable jusqu&apos;au{' '}
                  {subscriptionEnd?.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </>
            ) : isFreeAccess ? (
              <>
                <p className="text-xl font-bold text-green-600">💚 Accès complet gratuit</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  En tant que {session?.user?.gender === 'couple' ? 'couple' : 'femme'}, vous
                  profitez de toutes les fonctionnalités sans payer.
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                Compte gratuit — accès limité
              </p>
            )}
          </div>
          {(isPremium || isFreeAccess) && (
            <span className="badge badge-success">✓ Accès complet</span>
          )}
        </div>
      </div>

      {/* Avantages */}
      <div className="mb-10">
        <h2 className="font-bold font-heading text-lg mb-4 text-slate-900 dark:text-slate-100">
          Ce que Premium débloque
        </h2>
        <ul className="space-y-2">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
              <span className="text-green-500 mt-0.5">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Plans — affichés uniquement pour les hommes */}
      {isFreeAccess ? (
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">💚</div>
          <p className="font-bold font-heading text-lg mb-2">
            Aucun abonnement nécessaire
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Les femmes et les couples profitent gratuitement de toutes les fonctionnalités.
            C&apos;est notre façon de garantir une communauté équilibrée.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`card flex flex-col ${
              plan.highlighted
                ? 'border-primary-400 dark:border-primary-600 ring-2 ring-primary-200 dark:ring-primary-900'
                : ''
            }`}
          >
            {plan.highlighted && (
              <span className="self-start badge bg-primary-600 text-white text-xs mb-3">
                ⭐ Meilleur rapport
              </span>
            )}
            <h3 className="font-bold font-heading text-lg mb-1">{plan.name}</h3>
            <p className="text-3xl font-bold text-primary-600 mb-1">{plan.price}€</p>
            <p className="text-sm text-slate-500 mb-6">soit {plan.monthly}</p>
            <button
              onClick={() => handleCheckout(plan.tier)}
              disabled={loading !== null}
              className={`mt-auto py-3 font-bold rounded-lg transition-all disabled:opacity-50 ${
                plan.highlighted
                  ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg'
                  : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950'
              }`}
            >
              {loading === plan.tier ? 'Redirection...' : isPremium ? 'Prolonger' : 'Choisir'}
            </button>
          </div>
        ))}
      </div>

      )}

      {!isFreeAccess && (
        <p className="text-center text-xs text-slate-500 mt-8">
          💳 Paiement unique sécurisé par Stripe · Aucune reconduction automatique · Facture
          par email
        </p>
      )}
    </div>
  )
}
