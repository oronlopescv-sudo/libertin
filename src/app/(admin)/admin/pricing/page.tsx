'use client'

import React, { useState, useEffect } from 'react'
import { getAllPricingTiers, formatPrice } from '@/config/pricing'
import type { PricingTier } from '@/config/pricing'

/**
 * 💰 ADMIN - PRICING MANAGEMENT
 * Página para gerenciar planos de preço
 */

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<PricingTier | null>(null)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/pricing')
        if (!response.ok) throw new Error('Failed to fetch pricing')
        const data = await response.json()
        setPlans(data)
      } catch (error) {
        console.error('Error loading pricing:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [])

  const handleUpdatePlan = async (plan: PricingTier) => {
    try {
      const response = await fetch(`/api/admin/pricing/${plan.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      })

      if (!response.ok) throw new Error('Failed to update pricing')
      
      setPlans(plans.map(p => p.name === plan.name ? plan : p))
      setEditingPlan(null)
    } catch (error) {
      console.error('Error updating pricing:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">⌛</div>
          <p className="text-slate-400">Carregando planos de preço...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💰 Gerenciamento de Preços</h1>
          <p className="text-slate-400">Edite os planos de preço e configurações de features</p>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              {/* Plan Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{plan.displayName}</h3>
                  {plan.isPopular && (
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Popular</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-white">
                  {formatPrice(plan.priceEuro, 'EUR')}
                </p>
                {plan.priceEuro > 0 && (
                  <p className="text-slate-400 text-sm">/mês</p>
                )}
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Features</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className={plan.hasVideoCall ? 'text-green-400' : 'text-slate-500'}>
                      {plan.hasVideoCall ? '✓' : '✗'} Videochamada
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className={plan.hasVoiceCall ? 'text-green-400' : 'text-slate-500'}>
                      {plan.hasVoiceCall ? '✓' : '✗'} Voz
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className={plan.hasAdvancedFilters ? 'text-green-400' : 'text-slate-500'}>
                      {plan.hasAdvancedFilters ? '✓' : '✗'} Filtros Avançados
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className={plan.hasVerified ? 'text-green-400' : 'text-slate-500'}>
                      {plan.hasVerified ? '✓' : '✗'} Verificado
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className={plan.hasGallery ? 'text-green-400' : 'text-slate-500'}>
                      {plan.hasGallery ? '✓' : '✗'} Galeria
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className={plan.hasPriority ? 'text-green-400' : 'text-slate-500'}>
                      {plan.hasPriority ? '✓' : '✗'} Prioridade
                    </span>
                  </div>
                </div>
              </div>

              {/* Limits */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Limites</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>📝 Mensagens: <span className="font-semibold">{plan.maxMessages}</span></div>
                  <div>🖼️ Fotos: <span className="font-semibold">{plan.maxPhotos}</span></div>
                  <div>👥 Perfis: <span className="font-semibold">{plan.maxProfiles}</span></div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => setEditingPlan(plan)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition-colors"
              >
                ✏️ Editar Plano
              </button>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-2xl font-bold text-white mb-4">
                Editar {editingPlan.displayName}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Preço (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.priceEuro}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        priceEuro: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Max Mensagens
                    </label>
                    <input
                      type="number"
                      value={editingPlan.maxMessages}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          maxMessages: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Max Fotos
                    </label>
                    <input
                      type="number"
                      value={editingPlan.maxPhotos}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          maxPhotos: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.isPopular}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          isPopular: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">Marcar como Popular</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdatePlan(editingPlan)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
