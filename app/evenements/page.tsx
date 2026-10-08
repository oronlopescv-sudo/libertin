'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import { EventCard } from '@/components/event-card';
import { CreateEventForm } from '@/components/create-event-form';
import { useAuth } from '@/context/auth-context';
import { fetchResilient } from '@/lib/fetch-resilient';
import type { Event } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Plus, X, Calendar, Filter } from 'lucide-react';

export default function ÉvénementsPage() {
  const { user, isPremium, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('');
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [erreurJoin, setErreurJoin] = useState('');
  // Retorno do Stripe (?annonces=succes|annule) — antes o utilizador voltava
  // da página de pagamento sem qualquer confirmação.
  const [avisoPagamento, setAvisoPagamento] = useState('');

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('annonces');
    if (!param) return;
    setAvisoPagamento(
      param === 'succes'
        ? '✅ Paiement confirmé — votre annonce est en ligne !'
        : 'Paiement annulé — rien n\'a été prélevé.'
    );
    window.history.replaceState({}, '', '/evenements');
  }, []);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      // Pela rota do servidor (identidade + RLS), não pelo client anónimo.
      const qs = new URLSearchParams();
      if (filterType !== 'all') qs.set('type', filterType);
      if (filterCity) qs.set('city', filterCity);
      const res = await fetchResilient(`/api/events${qs.size ? `?${qs.toString()}` : ''}`);
      const data = await res.json().catch(() => ({}) as { events?: Event[] });
      if (res.ok) setEvents(data.events ?? []);
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err);
    } finally {
      setLoadingEvents(false);
    }
  }, [filterType, filterCity]);

  // Charge les événements où le membre s'est déjà manifesté, pour afficher
  // l'état « Intéressé ✓ » et permettre de se retirer d'un clic.
  const loadJoined = useCallback(async () => {
    try {
      const res = await fetchResilient('/api/events/join');
      if (res.ok) {
        const data = await res.json();
        setJoinedIds(new Set(data.eventIds ?? []));
      }
    } catch {
      /* silencieux : les cartes s'affichent simplement non inscrites */
    }
  }, []);

  useEffect(() => {
    if (user && isPremium) {
      loadEvents();
      loadJoined();
    }
  }, [user, isPremium, loadEvents, loadJoined]);

  const traiterReponseInscription = async (res: Response, messageDefaut: string) => {
    const data = await res.json().catch(() => ({}));
    if (res.ok) return true;
    if (data.premiumRequired) {
      router.push('/abonnements');
      return false;
    }
    if (res.status === 401) {
      router.push('/login');
      return false;
    }
    setErreurJoin(data.error ?? messageDefaut);
    return false;
  };

  const handleJoinEvent = async (eventId: string) => {
    setBusyId(eventId);
    setErreurJoin('');
    try {
      const res = await fetchResilient('/api/events/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      if (await traiterReponseInscription(res, 'Impossible de rejoindre cet événement')) {
        await loadEvents();
        await loadJoined();
      }
    } catch {
      setErreurJoin('Erreur réseau. Vérifiez votre connexion et réessayez.');
    } finally {
      setBusyId(null);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    setBusyId(eventId);
    setErreurJoin('');
    try {
      const res = await fetchResilient('/api/events/join', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      if (await traiterReponseInscription(res, "Impossible de se retirer de l'événement")) {
        await loadEvents();
        await loadJoined();
      }
    } catch {
      setErreurJoin('Erreur réseau. Vérifiez votre connexion et réessayez.');
    } finally {
      setBusyId(null);
    }
  };

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
              À partir de 9 €/mois
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Événements Libertins</h1>
            <p className="text-zinc-400 text-sm">
              Découvrez et participez aux soirées privées, rencontres et événements exclusifs près de chez vous.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-sm hover:opacity-95 shadow-lg shadow-[#D4145A]/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Créer un événement</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl bg-[#1C102B] border border-[#2C1B3D]">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Filter className="w-4 h-4" />
            <span>Filtres :</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#2C1B3D] border border-[#3D2654] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4145A]"
          >
            <option value="all">Tous les types</option>
            <option value="festa">🎉 Fête Privée</option>
            <option value="gang_bang">🔥 Gang Bang</option>
            <option value="troca">💑 Échange de Couples</option>
            <option value="other">⭐ Autre</option>
          </select>
          <input
            type="text"
            placeholder="Filtrer par ville..."
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="flex-1 min-w-[150px] bg-[#2C1B3D] border border-[#3D2654] rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
          />
        </div>

        {/* Retour de paiement Stripe */}
        {avisoPagamento && (
          <div className={`mb-6 p-3 rounded-xl text-sm flex items-center justify-between gap-3 ${avisoPagamento.startsWith('✅')
            ? 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-300'
            : 'bg-rose-950/60 border border-rose-800/40 text-rose-300'}`}>
            <span>{avisoPagamento}</span>
            <button
              onClick={() => setAvisoPagamento('')}
              className="p-1 hover:text-white shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Erreur d'inscription / retrait */}
        {erreurJoin && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-300 text-sm flex items-center justify-between gap-3">
            <span>{erreurJoin}</span>
            <button
              onClick={() => setErreurJoin('')}
              className="p-1 hover:text-white shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Events List */}
        {loadingEvents ? (
          <div className="text-center py-12 text-zinc-400">
            Chargement des événements...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#2C1B3D] flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Aucun événement pour le moment</h3>
              <p className="text-zinc-400 text-sm max-w-md mx-auto">
                Soyez le premier à organiser un événement libertin dans votre région. Créez une annonce et trouvez des participants enthousiastes.
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-sm hover:opacity-95 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Créer le premier événement</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isJoined={joinedIds.has(event.id)}
                busy={busyId === event.id}
                onJoin={handleJoinEvent}
                onLeave={handleLeaveEvent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1C102B] border border-[#3D2654] rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Créer un événement</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 rounded-full bg-[#2C1B3D] text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CreateEventForm
              onSuccess={() => {
                setShowCreateForm(false);
                loadEvents();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}