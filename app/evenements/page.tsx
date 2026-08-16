'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function ÉvénementsPage() {
  // Lit l'utilisateur connecté depuis le contexte d'authentification (Supabase
  // Auth). L'ancienne version décodait `localStorage.auth_token` (base64 +
  // Buffer) : ce jeton n'est jamais écrit par la nouvelle auth, et Buffer
  // n'existe pas dans le navigateur — la page voyait donc toujours un visiteur.
  const { user, isPremium, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-white">
          Chargement...
        </div>
      </div>
    );
  }

  if (!user || !isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-[#D4145A]/20 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-[#D4145A]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Événements</h1>
              <p className="text-zinc-400 mb-6">
                Seuls les membres Premium peuvent créer et participer aux événements.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/abonnements"
                className="block py-3 px-6 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition"
              >
                Passer à Premium
              </Link>
              <Link
                href="/"
                className="block py-3 px-6 bg-[#2C1B3D] rounded-lg font-semibold text-white hover:bg-[#3C2B4D] transition"
              >
                Retour à l'accueil
              </Link>
            </div>
            <p className="text-sm text-zinc-500">
              À partir de 4,58 €/mois
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Premium - Mostrar eventos
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Événements</h1>
        <div className="text-center py-12 text-zinc-400">
          Événements carregando...
        </div>
      </div>
    </div>
  );
}
