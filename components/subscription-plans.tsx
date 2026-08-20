'use client';

import React, { useState, useEffect } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
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
  Receipt,
  Loader2,
} from 'lucide-react';

interface StatutFacturation {
  stripeCustomerId: string | null;
  subscriptionEnd: string | null;
  planTitle: string;
}

export function AbonnementPlans() {
  const { user, isPremium, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<AbonnementPlan | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statutFacturation, setStatutFacturation] = useState<StatutFacturation | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // 1. Lit le retour Stripe (`?paiement=succes|annule`) après redirection depuis
  //    la page de paiement. Sur succès, on rafraîchit le profil : le webhook a
  //    normalement déjà mis à jour `subscription_tier` / `subscription_end` en base.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paiement = params.get('paiement');

    if (paiement === 'succes') {
      setSuccessMessage(
        'Paiement confirmé ! Votre Pass Premium est désormais actif. Bienvenue parmi les membres privilégiés.'
      );
      refreshUser();
    } else if (paiement === 'annule') {
      setErrorMessage(
        'Le paiement a été annulé. Aucun montant n’a été débité. Vous pouvez réessayer quand vous le souhaitez.'
      );
    }

    if (paiement) {
      // Nettoie l’URL pour ne pas réafficher le message au prochain rendu.
      const url = new URL(window.location.href);
      url.searchParams.delete('paiement');
      window.history.replaceState({}, '', url.toString());
    }
  }, [refreshUser]);

  // 2. Charge l’état de facturation (présence d’un stripe_customer_id) pour
  //    décider d’afficher le bouton « Gérer ma facturation ».
  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const res = await fetchResilient('/api/payments/status');
        if (!res.ok) return;
        const data = await res.json();
        if (!actif) return;
        setStatutFacturation({
          stripeCustomerId: data.stripeCustomerId ?? null,
          subscriptionEnd: data.subscriptionEnd ?? null,
          planTitle: data.planTitle ?? 'Compte Découverte',
        });
      } catch {
        /* silencieux : la section facturation reste masquée */
      }
    })();
    return () => {
      actif = false;
    };
  }, [successMessage]);

  const handleOpenConfirm = (plan: AbonnementPlan) => {
    if (plan.id === 'FREE') return;
    setSelectedPlan(plan);
    setConfirmModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !user) return;
    setIsProcessing(true);

    try {
      const res = await fetchResilient('/api/payments/create-checkout', {
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

  const handleOuvrirPortail = async () => {
    setPortalLoading(true);
    try {
      const res = await fetchResilient('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: '/abonnements' }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || data.message || "Impossible d'ouvrir le portail de facturation.");
      }
    } catch {
      alert("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setPortalLoading(false);
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

      {/* Cancellation / Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-700/50 text-amber-200 text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gestion de la facturation (uniquement si un client Stripe existe) */}
      {statutFacturation?.stripeCustomerId && (
        <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xs text-zinc-300">
              <strong className="block text-white">Gérer ma facturation</strong>
              <span>Consultez vos factures et mettez à jour votre moyen de paiement via le portail Stripe sécurisé.</span>
            </div>
          </div>
          <button
            onClick={handleOuvrirPortail}
            disabled={portalLoading}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60"
          >
            {portalLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ouverture…</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Portail de facturation</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Note de transparence sur le paiement */}
      <div className="p-4 rounded-xl bg-[#1C102B] border border-[#2C1B3D] text-zinc-300 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#E86B7A] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-1">Paiement sécurisé par Stripe</strong>
          <span>
            Le règlement s&apos;effectue sur la page sécurisée de Stripe. Votre abonnement est
            activé automatiquement après confirmation du paiement. Intitulé bancaire discret
            « RP-SERVICES », sans mention libertine. Les Pass sont des forfaits à durée
            déterminée : ils expirent à la date de fin sans renouvellement automatique.
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
                    {plan.id === 'FREE'
                      ? 'Accès basique gratuit'
                      : 'Abonnement mensuel'}
                  </div>
                </div>

                {/* Price Display — mensual récurrent en vedette */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      {plan.pricePerMonth === 0 ? '0€' : `${plan.pricePerMonth.toFixed(2)}€`}
                    </span>
                    {plan.id !== 'FREE' && (
                      <span className="text-xs text-zinc-400">
                        / mois
                      </span>
                    )}
                  </div>

                  {plan.id !== 'FREE' && (
                    <div className="text-xs text-[#E86B7A] font-semibold flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-[#D4145A]/20 font-bold text-white">
                        prélevé chaque mois
                      </span>
                      <span>· sans engagement</span>
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
                Vous allez être redirigé vers la page de paiement sécurisée de Stripe
                pour régler votre abonnement. Aucun montant n&apos;est débité tant que
                vous n&apos;avez pas validé le paiement sur Stripe.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#2C1B3D] border border-[#3D2654] space-y-2 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Offre sélectionnée:</span>
                <span className="font-bold text-white">{selectedPlan.title}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Facturation:</span>
                <span className="font-bold text-white">Mensuelle récurrente</span>
              </div>
              <div className="pt-2 border-t border-[#3D2654] flex justify-between text-sm">
                <span className="font-bold text-white">Prélèvement mensuel :</span>
                <span className="font-extrabold text-[#E86B7A]">{selectedPlan.pricePerMonth.toFixed(2)} € / mois</span>
              </div>
            </div>

            <button
              onClick={handleConfirmUpgrade}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-[#D4145A]/30 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirection vers Stripe…</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>S'abonner — {selectedPlan.pricePerMonth.toFixed(2)} € / mois</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}