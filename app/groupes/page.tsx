'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GroupCard } from '@/components/group-card';
import { Group } from '@/lib/types';
import { getSupabaseGroups, createSupabaseGroup } from '@/lib/supabase';
import {
  Users,
  Plus,
  Search,
  X,
} from 'lucide-react';

export default function GroupesPage() {
  // const { ... } = useAuth();
  const user = null;
  const usersList = [];
  const isPremium = false;
  const [groups, setGroups] = useState<Group[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  // New Group Form State
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState<'clubs' | 'soirees' | 'discretion' | 'aventure'>('clubs');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupIsPrivate, setNewGroupIsPrivate] = useState(false);
  const [newGroupMaxMembers, setNewGroupMaxMembers] = useState(50);

  const loadGroups = async () => {
    const data = await getSupabaseGroups();
    setGroups(data);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const filteredGroups = groups.filter((g) => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle || !user) return;

    const created = await createSupabaseGroup({
      name: newGroupTitle,
      category: newGroupCategory,
      description: newGroupDesc,
      isPrivate: newGroupIsPrivate,
      maxMembers: newGroupMaxMembers,
      creatorId: user.id,
      creatorName: user.username,
      coverUrl: '',
    });

    if (created) {
      await loadGroups();
      setCreateModalOpen(false);
      setNewGroupTitle('');
      setNewGroupDesc('');
    } else {
      alert('Erreur lors de la création du groupe.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1C102B] border border-[#2C1B3D] p-6 rounded-3xl shadow-xl">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-[#D4145A]" />
              <span>Groupes & Cercle Libertins</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Échangez avec les habitués des clubs libertins, organisez des soirées privées et partagez vos expériences.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-[#D4145A]/25 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Groupe</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: 'Tous les groupes' },
              { id: 'clubs', label: 'Clubs Libertins' },
              { id: 'soirees', label: 'Soirées Privées' },
              { id: 'discretion', label: 'Conseils & Débutants' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-[#D4145A] text-white font-bold'
                    : 'bg-[#2C1B3D] text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un groupe..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#12091A] border border-[#3D2654] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>

        {/* Create Group Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#1C102B] border border-[#3D2654] rounded-2xl p-6 text-white space-y-5">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#2C1B3D] text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4145A]/20 border border-[#D4145A]/40 flex items-center justify-center text-[#E86B7A]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Créer un Nouveau Groupe</h3>
                  <p className="text-xs text-zinc-400">Rassemblez les membres autour d&apos;un thème ou d&apos;une région</p>
                </div>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Nom du groupe</label>
                  <input
                    type="text"
                    required
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    placeholder="ex: Soirées Privées Villa Lyon"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Catégorie</label>
                    <select
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                    >
                      <option value="clubs">Clubs Libertins</option>
                      <option value="soirees">Soirées Privées</option>
                      <option value="discretion">Conseils & Discrétion</option>
                      <option value="aventure">Aventures & Rencontres</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Membres Max</label>
                    <input
                      type="number"
                      min={10}
                      max={200}
                      value={newGroupMaxMembers}
                      onChange={(e) => setNewGroupMaxMembers(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Description & Règles du groupe</label>
                  <textarea
                    rows={3}
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Objectif du groupe, ville concernée, conditions d'entrée..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#12091A] border border-[#3D2654]">
                  <div>
                    <div className="font-bold text-white">Groupe Privé</div>
                    <div className="text-[10px] text-zinc-400">Entrée sur validation de l&apos;organisateur</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newGroupIsPrivate}
                    onChange={(e) => setNewGroupIsPrivate(e.target.checked)}
                    className="rounded border-[#3D2654] bg-[#1C102B] text-[#D4145A] focus:ring-0"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-[#D4145A]/25"
                >
                  Publier mon Groupe
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
