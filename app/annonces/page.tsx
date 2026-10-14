'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Megaphone, Plus, X, Trash2, MapPin, Lock, MessageSquare } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/context/auth-context';
import { fetchResilient } from '@/lib/fetch-resilient';

type Annonce = {
  id: string;
  userId: string;
  username: string;
  title: string;
  body: string;
  city: string;
  createdAt: string;
};

export default function AnnoncesPage() {
  const { user, isPremium, isLoading } = useAuth();
  const router = useRouter();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ouvert, setOuvert] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [city, setCity] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    try {
      const res = await fetchResilient('/api/annonces');
      const data = await res.json().catch(() => ({}));
      if (res.ok) setAnnonces(data.annonces ?? []);
      else setErreur(data.error ?? 'Impossible de charger les annonces.');
    } catch {
      setErreur('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    charger();
  }, [user, isLoading, router, charger]);

  const publier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      const res = await fetchResilient('/api/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, city }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTitle('');
        setBody('');
        setCity('');
        setOuvert(false);
        await charger();
      } else if (data.premiumRequired) {
        router.push('/abonnements');
      } else {
        setErreur(data.error ?? "Impossible de publier l'annonce.");
      }
    } catch {
      setErreur('Erreur réseau. Réessayez.');
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    const res = await fetchResilient(`/api/annonces/${id}`, { method: 'DELETE' });
    if (res.ok) setAnnonces((l) => l.filter((a) => a.id !== id));
    else setErreur('Suppression impossible.');
  };

  const ecrire = async (userId: string) => {
    const res = await fetchResilient('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: userId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.groupId) router.push(`/chat/${data.groupId}`);
    else if (data.premiumRequired) router.push('/abonnements');
    else setErreur(data.error ?? "Impossible d'ouvrir la conversation.");
  };

  const champ =
    'w-full px-3 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]';

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D4145A]/20 border border-[#D4145A]/40 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-[#E86B7A]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Annonces</h1>
              <p className="text-xs text-zinc-400">Les annonces des membres Premium.</p>
            </div>
          </div>
          {isPremium ? (
            <button
              onClick={() => setOuvert(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Annonce
            </button>
          ) : (
            <Link
              href="/abonnements"
              className="px-4 py-2.5 rounded-xl bg-[#2C1B3D] border border-[#3D2654] text-amber-300 text-xs font-bold flex items-center gap-2"
            >
              <Lock className="w-4 h-4" /> Publier : Premium
            </Link>
          )}
        </div>

        {erreur && <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/40 text-red-300 text-xs">{erreur}</div>}

        {chargement ? (
          <p className="text-center text-zinc-400 text-sm py-10">Chargement…</p>
        ) : annonces.length === 0 ? (
          <p className="text-center text-zinc-400 text-sm py-10">Aucune annonce pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {annonces.map((a) => (
              <li key={a.id} className="p-5 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-white">{a.title}</h2>
                  {(a.userId === user?.id || user?.role === 'admin') && (
                    <button onClick={() => supprimer(a.id)} aria-label="Supprimer" className="text-zinc-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words">{a.body}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-3">
                    <Link href={`/profil/${a.userId}`} className="text-[#E86B7A] font-semibold hover:underline">
                      {a.username}
                    </Link>
                    {a.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {a.city}
                      </span>
                    )}
                    <span>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                  </span>
                  {a.userId !== user?.id && isPremium && (
                    <button onClick={() => ecrire(a.userId)} className="flex items-center gap-1 text-[#E86B7A] font-bold">
                      <MessageSquare className="w-3.5 h-3.5" /> Écrire
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {ouvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <form onSubmit={publier} className="relative w-full max-w-md bg-[#1C102B] border border-[#3D2654] rounded-2xl p-6 space-y-3">
            <button type="button" onClick={() => setOuvert(false)} className="absolute top-3 right-3 text-zinc-400 hover:text-white" aria-label="Fermer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold">Nouvelle annonce</h3>
            <input className={champ} placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
            <textarea className={champ} placeholder="Votre annonce…" rows={5} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1500} required />
            <input className={champ} placeholder="Ville (optionnel)" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
            {erreur && <p className="text-xs text-red-300">{erreur}</p>}
            <button disabled={envoi} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-sm font-bold disabled:opacity-60">
              {envoi ? 'Publication…' : "Publier l'annonce"}
            </button>
            <p className="text-[11px] text-zinc-500">Visible 30 jours. Maximum 5 annonces actives.</p>
          </form>
        </div>
      )}
    </div>
  );
}
