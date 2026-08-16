'use client';

import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS, getPlanDetails } from '@/lib/stripe';
import { AbonnementPlan } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import {
  Crown,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
} from 'lucide-react';

export function AbonnementPlans() {
  const { user, isPremium } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<AbonnementPlan | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenConfirm = (plan: AbonnementPlan) => {
    if (plan.id === 'FREE') return;
    setSelectedPlan(plan);
    setConfirmModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !user) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedPlan.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        alert(data.message || data.error || "Le paiement n'est pas disponible pour le moment.");
        return;
      }

      // Redirige vers la page de paiement Stripe. L'abonnement n'est activé
      // qu'après confirmation réelle du paiement, côté serveur (webhook) —
      // jamais directement depuis le navigateur.
      window.location.href = data.url;
    } catch {
      alert("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setIsProcessing(false);
      setConfirmModalOpen(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Current Abonnement Status Badge */}
      {user && (
        <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#D4145A]/20 border border-[#D4145A]/40 flex items-center justify-center">
              <Crown className="w-6 h-6 text-[#E86B7A]" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-medium">Votre Formule Actuelle</div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <span>{getPlanDetails(user.subscriptionTier).title}</span>
                {isPremium && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold uppercase tracking-wider">
                    Actif
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-zinc-400">
            {user.subscriptionEnd ? (
              <div>
                Valide jusqu&apos;au <strong className="text-white">{new Date(user.subscriptionEnd).toLocaleDateString('fr-FR')}</strong>
              </div>
            ) : (
              <div>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</div>
            )}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Payment Notice */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-1">Passerelle de paiement non configurée</strong>
          <span>
            Le module de paiement en ligne (Stripe) n&apos;est pas encore activé.
            L&apos;activation ci-dessous met à jour votre statut localement à des fins de test.
          </span>
        </div>
      </div>

      {/* Grid of Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = user?.subscriptionTier === plan.id;
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-[#1C102B] border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isPopular
                  ? 'border-[#D4145A] shadow-2xl shadow-[#D4145A]/20 scale-105 z-10'
                  : isCurrent
                  ? 'border-emerald-500/50'
                  : 'border-[#2C1B3D] hover:border-[#3D2654]'
              }`}
            >
              {/* Popular / Best Value Ribbon */}
              {isPopular && (
                <div className="bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-[11px] font-bold uppercase tracking-wider py-1.5 text-center shadow-md flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>{plan.savings}</span>
                </div>
              )}

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {plan.durationMonths > 0
                      ? `Engagement sur ${plan.durationMonths} mois`
                      : 'Accès basique gratuit'}
                  </div>
                </div>

                {/* Price Display */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      {plan.totalPrice === 0 ? '0€' : `${plan.totalPrice}€`}
                    </span>
                    {plan.durationMonths > 0 && (
                      <span className="text-xs text-zinc-400">
                        / au total
                      </span>
                    )}
                  </div>

                  {plan.durationMonths > 0 && (
                    <div className="text-xs text-[#E86B7A] font-semibold flex items-center gap-1">
                      <span>soit seulement</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#D4145A]/20 font-bold text-white">
                        {plan.pricePerMonth.toFixed(2)}€ / mois
                      </span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-3 border-t border-[#2C1B3D]">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-snug">
                      <Check className="w-4 h-4 text-[#D4145A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer / CTA Button */}
              <div className="p-6 pt-0">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-xs font-bold flex items-center justify-center gap-2 cursor-default"
                  >
                    <Check className="w-4 h-4" />
                    <span>Formule Actuelle</span>
                  </button>
                ) : plan.id === 'FREE' ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-[#2C1B3D] text-zinc-500 text-xs font-bold cursor-default"
                  >
                    Offre par défaut
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenConfirm(plan)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white hover:opacity-95 shadow-[#D4145A]/30'
                        : 'bg-[#D4145A] text-white hover:bg-[#B50E4A]'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                    <span>Activer {plan.title}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activation Confirmation Modal */}
      {confirmModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#1C102B] border border-[#3D2654] rounded-2xl shadow-2xl p-6 text-white space-y-6">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#2C1B3D] text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4145A] to-[#E86B7A] flex items-center justify-center mx-auto shadow-lg shadow-[#D4145A]/25">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Confirmer l&apos;activation</h3>
              <p className="text-xs text-zinc-400">
                Le module de paiement n&apos;est pas encore activé.
                Cette action mettra à jour votre formule sans débiter votre compte.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#2C1B3D] border border-[#3D2654] space-y-2 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Offre sélectionnée:</span>
                <span className="font-bold text-white">{selectedPlan.title}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Durée:</span>
                <span className="font-bold text-white">{selectedPlan.durationMonths} Mois</span>
              </div>
              <div className="pt-2 border-t border-[#3D2654] flex justify-between text-sm">
                <span className="font-bold text-white">Montant indicatif :</span>
                <span className="font-extrabold text-[#E86B7A]">{selectedPlan.totalPrice} €</span>
              </div>
            </div>

            <button
              onClick={handleConfirmUpgrade}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-[#D4145A]/30 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activation en cours...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Confirmer l&apos;activation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
