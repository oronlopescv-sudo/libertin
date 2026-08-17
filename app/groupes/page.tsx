'use client';

import React, { useEffect, useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import { Navbar } from '@/components/navbar';
import { CreateGroupModal } from '@/components/create-group-modal';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  maxMembers: number;
  isPrivate: boolean;
  createdAt: string;
}

export default function GroupesPage() {
  // Utilisateur connecté depuis le contexte d'authentification (Supabase Auth),
  // et non plus depuis `localStorage.auth_token` (jeton mort, jamais écrit par
  // la nouvelle auth — la page voyait toujours un visiteur).
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [erreur, setErreur] = useState('');

  // Le bouton « Rejoindre » n'avait aucun gestionnaire : cliquer dessus ne
  // faisait strictement rien, sans message ni navigation.
  const handleJoin = async (groupId: string) => {
    setErreur('');
    setJoiningId(groupId);
    try {
      const res = await fetchResilient('/api/groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push(`/chat/${groupId}`);
        return;
      }
      if (data.premiumRequired) {
        router.push('/abonnements');
        return;
      }
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      setErreur(data.error ?? 'Impossible de rejoindre ce groupe');
    } catch {
      setErreur('Erreur réseau. Vérifiez votre connexion et réessayez.');
    } finally {
      setJoiningId(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Buscar grupos
        const res = await fetchResilient('/api/groups');
        const data = await res.json();
        setGroups(data.groups || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredGroups = groups.filter((group) => {
    if (filter === 'private') return group.isPrivate;
    if (filter === 'public') return !group.isPrivate;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {erreur && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/40 text-rose-300 text-sm mb-6">
            {erreur}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Groupes</h1>
            <p className="text-zinc-400">Trouvez ou créez des groupes selon vos envies</p>
          </div>
          {user && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${
                isPremium
                  ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white hover:opacity-90'
                  : 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-50'
              }`}
              title={isPremium ? 'Créer un nouveau groupe' : 'Réservé aux membres Premium'}
            >
              <Plus className="w-5 h-5" />
              Créer un groupe
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-[#D4145A] text-white'
                : 'bg-[#2C1B3D] text-zinc-400 hover:bg-[#3C2B4D]'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'public'
                ? 'bg-[#D4145A] text-white'
                : 'bg-[#2C1B3D] text-zinc-400 hover:bg-[#3C2B4D]'
            }`}
          >
            Publics
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'private'
                ? 'bg-[#D4145A] text-white'
                : 'bg-[#2C1B3D] text-zinc-400 hover:bg-[#3C2B4D]'
            }`}
          >
            Privés
          </button>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center text-zinc-400">Chargement des groupes...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Aucun groupe trouvé</p>
            {user && isPremium && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Groupe
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="p-6 bg-[#1C102B] rounded-lg border border-[#2C1B3D] hover:border-[#D4145A] transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex-1">{group.name}</h3>
                  {group.isPrivate && (
                    <span className="text-xs bg-[#D4145A]/20 text-[#D4145A] px-2 py-1 rounded">
                      Privé
                    </span>
                  )}
                </div>

                {group.description && (
                  <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                  <span className="capitalize">{group.category}</span>
                </div>

                <button
                  onClick={() => handleJoin(group.id)}
                  disabled={joiningId === group.id}
                  className="w-full py-2 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                >
                  {joiningId === group.id ? 'Inscription...' : 'Rejoindre'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {user && (
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          userAbonnement={{
            tier: user.subscriptionTier,
            expiresAt: user.subscriptionEnd ?? null,
          }}
        />
      )}
    </div>
  );
}
