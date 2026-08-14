'use client';

import { isPremium as isPremiumFn } from '@/lib/premium';
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  subscriptionTier: string;
  subscriptionEnd: string | null;
}

export default function ÉvénementsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const userData = JSON.parse(Buffer.from(token, 'base64').toString());
        setUser(userData);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-white">
          Chargement...
        </div>
      </div>
    );
  }

  const isPremium = isPremiumFn(user);

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
              À partir de 2,08 €/mois
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
