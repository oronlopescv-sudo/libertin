'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/context/auth-context';
import { fetchResilient } from '@/lib/fetch-resilient';
import {
  MessageSquare,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Loader2,
  Search,
  Inbox,
} from 'lucide-react';

interface Conversation {
  groupId: string;
  userId: string;
  username: string;
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean;
}

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

function tempsRelatif(iso: string): string {
  const d = new Date(iso);
  const maintenant = new Date();
  const diffMs = maintenant.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffJ = Math.floor(diffH / 24);

  if (diffMin < 1) return 'à l’instant';
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffH < 24) return `il y a ${diffH} h`;
  if (diffJ === 1) return 'hier';
  if (diffJ < 7) return `il y a ${diffJ} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function MessageriePage() {
  const { user, isPremium } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    let actif = true;
    (async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetchResilient('/api/conversations');
        const data = await res.json();
        if (!actif) return;
        if (res.ok) {
          setConversations(data.conversations ?? []);
        } else {
          setErreur(data.error ?? 'Impossible de charger vos conversations.');
        }
      } catch {
        if (!actif) return;
        setErreur('Erreur réseau. Vérifiez votre connexion.');
      } finally {
        if (actif) setIsLoading(false);
      }
    })();
    return () => {
      actif = false;
    };
  }, [user]);

  const conversationsFiltrees = conversations.filter((c) =>
    c.username.toLowerCase().includes(recherche.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#D4145A]/20 border border-[#D4145A]/40 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-[#E86B7A]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Messagerie</h1>
            <p className="text-xs text-zinc-400">
              Vos conversations privées avec les autres membres.
            </p>
          </div>
        </div>

        {/* Bannière non-Premium : la lecture est libre, l'envoi est Premium. */}
        {!isPremium && user?.role !== 'admin' && (
          <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-700/40 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Vous pouvez lire vos conversations. Pour <strong>répondre</strong> et
                en démarrer de nouvelles, un Pass Premium est requis.
              </span>
            </div>
            <Link
              href="/abonnements"
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#D4145A] text-white font-bold text-[11px]"
            >
              S&apos;abonner
            </Link>
          </div>
        )}

        {/* Recherche */}
        {conversations.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un membre…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1C102B] border border-[#2C1B3D] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
            />
          </div>
        )}

        {/* États */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Chargement de vos conversations…</span>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <Lock className="w-10 h-10 text-[#D4145A]/60" />
            <p className="text-sm text-zinc-400">Connectez-vous pour accéder à votre messagerie.</p>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold"
            >
              Se connecter
            </Link>
          </div>
        ) : erreur ? (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-300 text-sm">
            {erreur}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2C1B3D] flex items-center justify-center">
              <Inbox className="w-7 h-7 text-zinc-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-300">Aucune conversation pour le moment</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Rendez-vous dans « Découvrir », ouvrez un profil qui vous plaît et
                envoyez un message pour démarrer une conversation privée.
              </p>
            </div>
            <Link
              href="/decouvrir"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold"
            >
              Découvrir des membres
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {conversationsFiltrees.map((c) => (
              <li key={c.groupId}>
                <Link
                  href={`/chat/${c.groupId}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] hover:border-[#D4145A]/50 transition-colors group"
                >
                  <img
                    src={c.avatar || FALLBACK_AVATAR}
                    alt={c.username}
                    className="w-12 h-12 rounded-full object-cover border border-[#D4145A] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm truncate">
                        {c.username}
                      </span>
                      {c.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      {!c.isActive && (
                        <span className="text-[10px] text-zinc-600">(désactivé)</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {c.lastMessage
                        ? (c.lastMessageFromMe ? 'Vous : ' : '') + c.lastMessage
                        : 'Aucun message — démarrez la conversation'}
                    </p>
                  </div>
                  {c.lastMessageAt && (
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {tempsRelatif(c.lastMessageAt)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
            {conversationsFiltrees.length === 0 && (
              <li className="text-center text-sm text-zinc-500 py-8">
                Aucun membre ne correspond à « {recherche} ».
              </li>
            )}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}