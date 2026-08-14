'use client';

import { isPremium as isPremiumFn } from '@/lib/premium';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  subscriptionTier: string;
  subscriptionEnd: string | null;
}

export default function ChatPage() {
  const params = useParams();
  const groupId = params.groupId as string;
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
          Carregando...
        </div>
      </div>
    );
  }

  // Toda a gente pode ver as conversas.
  // A restrição de Premium aplica-se apenas ao envio de mensagens.
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-[#D4145A]/20 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-[#D4145A]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Chat de Grupo</h1>
              <p className="text-zinc-400 mb-6">
                Faça login para ver as conversas do grupo.
              </p>
            </div>
            <Link
              href="/login"
              className="block py-3 px-6 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = isPremiumFn(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Grupo: {groupId}</h1>
        <div className="bg-[#1C102B] rounded-lg p-6 border border-[#2C1B3D] text-center text-zinc-400">
          Chat carregando...
        </div>

        {/* Aviso visível para contas gratuitas: podem ver mas não escrever */}
        {!isPremium && (
          <div className="mt-4 bg-[#2C1B3D] border border-[#D4145A]/40 rounded-lg p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-[#D4145A] flex-shrink-0" />
            <div className="flex-1 text-sm text-zinc-300">
              Você pode ler as conversas. Para enviar mensagens, torne-se membro Premium.
            </div>
            <Link
              href="/abonnements"
              className="py-2 px-4 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg text-sm font-semibold text-white hover:opacity-90 transition whitespace-nowrap"
            >
              Ver planos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
