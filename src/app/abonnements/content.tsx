'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function AbonnementsContent() {
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier') || ''
  const [selectedTier, setSelectedTier] = useState(tier)

  const plans = [
    {
      id: 'PREMIUM_3M',
      name: '3 Mois',
      price: 16,
      months: 3,
      features: ['Accès illimité', 'Chat prioritaire', 'Support 24/7']
    },
    {
      id: 'PREMIUM_12M',
      name: '12 Mois ⭐',
      price: 25,
      months: 12,
      features: ['Accès illimité', 'Chat prioritaire', 'Support 24/7', 'Remise 50%']
    },
    {
      id: 'PREMIUM_24M',
      name: '24 Mois',
      price: 70,
      months: 24,
      features: ['Accès illimité', 'Chat prioritaire', 'Support 24/7', 'Remise 70%']
    }
  ]

  const handleSelectPlan = (id: string) => {
    setSelectedTier(id)
    // Aqui iria redirecionar para checkout
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Plans d'Abonnement Premium</h1>
      <p className="text-center text-gray-600 mb-12">Accès illimité à tous les profils et fonctionnalités</p>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`card p-8 text-center transition ${
              selectedTier === plan.id ? 'border-2 border-primary-500 shadow-lg' : 'border-2 border-transparent'
            }`}
          >
            <h3 className="text-2xl font-bold text-secondary-500 mb-4">{plan.name}</h3>
            <div className="text-5xl font-bold text-primary-500 mb-6">€{plan.price}</div>
            <p className="text-gray-600 mb-6">Valable {plan.months} mois</p>

            <ul className="space-y-3 mb-8 text-left">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-primary-500">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`btn-primary w-full ${selectedTier === plan.id ? 'ring-2 ring-primary-500' : ''}`}
            >
              Acheter maintenant
            </button>
          </div>
        ))}
      </div>

      {selectedTier && (
        <div className="max-w-md mx-auto mt-12 p-6 bg-blue-50 rounded-lg">
          <p className="text-center text-blue-700">
            <strong>Plan sélectionné:</strong> {plans.find(p => p.id === selectedTier)?.name}
          </p>
        </div>
      )}
    </div>
  )
}
