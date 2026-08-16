'use client';

import React, { useEffect, useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ChatBox } from '@/components/chat-box';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Lock, AlertCircle } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { user, isLoading } = useAuth();

  const [groupe, setGroupe] = useState<{ name: string; memberCount?: number } | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!user) {
      setChargement(false);
      return;
    }

    const charger = async () => {
      try {
        const res = await fetchResilient(`/api/groups/${groupId}`);
        if (res.ok) {
          const d = await res.json();
          setGroupe({ name: d.name ?? `Groupe ${groupId}`, memberCount: d.memberCount });
        } else {
          // Le groupe reste utilisable même si la fiche n'est pas disponible
          setGroupe({ name: `Groupe ${groupId}` });
        }
      } catch {
        setErreur('Erreur réseau. Vérifiez votre connexion.');
      } finally {
        setChargement(false);
      }
    };

    charger();
  }, [groupId, user]);

  if (isLoading || chargement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] text-zinc-400">
          Chargement du chat...
        </div>
      </div>
    );
  }

  // Tout le monde peut lire les conversations une fois connecté.
  // La restriction Premium porte uniquement sur l'envoi, gérée dans ChatBox.
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
              <h1 className="text-3xl font-bold text-white mb-2">Chat de groupe</h1>
              <p className="text-zinc-400 mb-6">
                Connectez-vous pour voir les conversations du groupe.
              </p>
            </div>
            <Link
              href="/login"
              className="block py-3 px-6 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center space-y-3 max-w-sm">
            <AlertCircle className="w-10 h-10 text-[#D4145A] mx-auto" />
            <p className="text-zinc-400 text-sm">{erreur}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/groupes"
          className="inline-block mb-4 text-sm text-zinc-400 hover:text-white transition"
        >
          ← Retour aux groupes
        </Link>
        <ChatBox
          groupId={groupId}
          groupName={groupe?.name ?? `Groupe ${groupId}`}
          memberCount={groupe?.memberCount}
        />
      </div>
    </div>
  );
}
