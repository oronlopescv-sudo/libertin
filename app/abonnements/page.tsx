'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AbonnementPlans } from '@/components/subscription-plans';
import { Crown, ShieldCheck, Lock, Sparkles, Check } from 'lucide-react';

function BandeauPaiement() {
  const { refreshUser } = useAuth();
  const [etat, setEtat] = useState<'rien' | 'attente' | 'ok' | 'lent' | 'annule'>('rien');

  useEffect(() => {
    const retour = new URLSearchParams(window.location.search).get('paiement');
    if (retour === 'annule') {
      setEtat('annule');
      return;
    }
    if (retour !== 'succes') return;

    setEtat('attente');
    let actif = true;
    let essais = 0;
    // Le webhook Stripe arrive quelques secondes après le retour : on
    // interroge l'état de l'abonnement jusqu'à ~30 s.
    const timer = setInterval(async () => {
      essais += 1;
      try {
        const res = await fetch('/api/payments/status', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!actif) return;
        if (res.ok && data.premium) {
          clearInterval(timer);
          setEtat('ok');
          refreshUser();
          return;
        }
      } catch {
        /* réessaie au prochain tour */
      }
      if (essais >= 15 && actif) {
        clearInterval(timer);
        setEtat('lent');
      }
    }, 2000);
    return () => {
      actif = false;
      clearInterval(timer);
    };
  }, [refreshUser]);

  if (etat === 'rien') return null;
  const textes = {
    attente: 'Paiement reçu — activation de votre abonnement en cours…',
    ok: 'Votre abonnement Premium est actif. Bienvenue !',
    lent: "Paiement reçu, mais l'activation prend plus de temps que prévu. Rechargez la page dans une minute ; si rien ne change, contactez le support.",
    annule: "Paiement annulé. Aucun montant n'a été prélevé.",
  } as const;
  return (
    <div className="p-4 rounded-xl bg-[#1C102B] border border-[#D4145A]/40 text-sm text-center text-white" role="status">
      {textes[etat]}
    </div>
  );
}

export default function AbonnementsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <BandeauPaiement />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4145A]/20 text-[#E86B7A] text-xs font-bold">
            <Crown className="w-4 h-4" />
            <span>Formules Membres Privilégiés</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Offres d&apos;Abonnement xlibertine
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Débloquez toutes les fonctionnalités libertines : défloutage des photos, tchats illimités, albums privés et invitations VIP.
          </p>
        </div>

        {/* Pricing Table Component */}
        <AbonnementPlans />

        {/* Feature Comparison Table */}
        <div className="p-6 rounded-3xl bg-[#1C102B] border border-[#2C1B3D] space-y-6">
          <h2 className="text-lg font-bold text-white text-center">
            Tableau Comparatif des Fonctionnalités
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#2C1B3D] text-zinc-400">
                  <th className="py-3 px-4 font-semibold">Fonctionnalité</th>
                  <th className="py-3 px-4 font-semibold text-center">Gratuit (0€)</th>
                  <th className="py-3 px-4 font-semibold text-center text-[#E86B7A]">Pass Épicurien / Privilège / VIP (9 / 15 / 25 €/mois)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C1B3D] text-zinc-300">
                <tr>
                  <td className="py-3 px-4">Création de profil & Recherche géographique</td>
                  <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Défloutage des photos de profil & albums privés</td>
                  <td className="text-center py-3 px-4 text-zinc-600">—</td>
                  <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Participation active aux tchats de groupe</td>
                  <td className="text-center py-3 px-4 text-zinc-600">Lecture seule</td>
                  <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Envoi de messages privés directs aux membres</td>
                  <td className="text-center py-3 px-4 text-zinc-600">—</td>
                  <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Mode Fantôme (visites de profil invisibles)</td>
                  <td className="text-center py-3 px-4 text-zinc-600">—</td>
                  <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-400">
          <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] flex items-center gap-3">
            <Lock className="w-6 h-6 text-[#E86B7A] shrink-0" />
            <div>
              <strong className="block text-white">Discrétion Bancaire</strong>
              Intitulé bancaire anonyme &quot;RP-SERVICES&quot; sans mention libertine.
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <strong className="block text-white">Sans Engagement</strong>
              Résiliable à tout moment en 1 clic depuis votre espace membre.
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#D4145A] shrink-0" />
            <div>
              <strong className="block text-white">Support Français 7j/7</strong>
              Une équipe basée en France pour vous assister à tout moment.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
