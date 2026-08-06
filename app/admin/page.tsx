'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/context/auth-context';
import {
  User,
  Group,
  SubscriptionTier,
  GenderType,
} from '@/lib/types';
import {
  getSupabaseUsersList,
  getSupabaseGroups,
  updateSupabaseProfile,
  deleteSupabaseUser,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  createSupabaseGroup,
  updateSupabaseGroup,
  deleteSupabaseGroup,
} from '@/lib/supabase';
import {
  ShieldCheck,
  Check,
  X,
  UserCheck,
  TrendingUp,
  Users,
  AlertCircle,
  Edit3,
  Trash2,
  Plus,
  Crown,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

export default function AdminPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'verification' | 'stats'>('users');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Users
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    category: 'clubs',
    maxMembers: 50,
    isPrivate: false,
    coverUrl: '',
  });

  // Verifications
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [users, groupsData, verifications] = await Promise.all([
        getSupabaseUsersList(200),
        getSupabaseGroups(),
        getPendingVerifications(),
      ]);
      setUsersList(users);
      setGroups(groupsData);
      setPendingVerifications(verifications);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors du chargement des données.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#12091A] text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="p-8 rounded-2xl bg-[#1C102B] border border-rose-800/40 text-center space-y-4 max-w-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold">Accès Réservé aux Administrateurs</h2>
            <p className="text-xs text-zinc-400">
              Vous devez être connecté avec un compte de modération pour consulter cette page.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // User Actions
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const endDate = new Date();
    if (editingUser.subscriptionTier === 'PREMIUM_3M') endDate.setMonth(endDate.getMonth() + 3);
    else if (editingUser.subscriptionTier === 'PREMIUM_12M') endDate.setMonth(endDate.getMonth() + 12);
    else if (editingUser.subscriptionTier === 'PREMIUM_24M') endDate.setMonth(endDate.getMonth() + 24);

    const ok = await updateSupabaseProfile(editingUser.id, {
      username: editingUser.username,
      email: editingUser.email,
      gender: editingUser.gender,
      role: editingUser.role,
      location: editingUser.location,
      bio: editingUser.bio,
      isVerified: editingUser.isVerified,
      subscriptionTier: editingUser.subscriptionTier,
      subscriptionEnd: editingUser.subscriptionTier === 'FREE' ? undefined : endDate.toISOString(),
    });

    if (ok) {
      await loadData();
      await refreshUser();
      setEditingUser(null);
    } else {
      alert('Erreur lors de la mise à jour du membre.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce membre ?')) {
      const ok = await deleteSupabaseUser(userId);
      if (ok) await loadData();
      else alert('Erreur lors de la suppression.');
    }
  };

  const handleQuickToggleVerified = async (u: User) => {
    const ok = await updateSupabaseProfile(u.id, { isVerified: !u.isVerified });
    if (ok) await loadData();
  };

  const handleQuickUpgradeSubscription = async (u: User, tier: SubscriptionTier) => {
    const endDate = new Date();
    if (tier === 'PREMIUM_3M') endDate.setMonth(endDate.getMonth() + 3);
    else if (tier === 'PREMIUM_12M') endDate.setMonth(endDate.getMonth() + 12);
    else if (tier === 'PREMIUM_24M') endDate.setMonth(endDate.getMonth() + 24);

    const ok = await updateSupabaseProfile(u.id, {
      subscriptionTier: tier,
      subscriptionEnd: tier === 'FREE' ? undefined : endDate.toISOString(),
    });
    if (ok) await loadData();
  };

  // Group Actions
  const handleSaveGroupEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    const ok = await updateSupabaseGroup(editingGroup.id, {
      name: editingGroup.name,
      description: editingGroup.description,
      category: editingGroup.category,
      coverUrl: editingGroup.coverUrl,
    });
    if (ok) {
      await loadData();
      setEditingGroup(null);
    } else {
      alert('Erreur lors de la mise à jour du club.');
    }
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const created = await createSupabaseGroup({
      name: newGroupData.name,
      description: newGroupData.description,
      creatorId: user.id,
      creatorName: user.username,
      category: newGroupData.category as Group['category'],
      maxMembers: Number(newGroupData.maxMembers),
      isPrivate: newGroupData.isPrivate,
      coverUrl: newGroupData.coverUrl,
    });
    if (created) {
      await loadData();
      setIsCreatingGroup(false);
      setNewGroupData({
        name: '',
        description: '',
        category: 'clubs',
        maxMembers: 50,
        isPrivate: false,
        coverUrl: '',
      });
    } else {
      alert('Erreur lors de la création du club.');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce club/groupe ?')) {
      const ok = await deleteSupabaseGroup(groupId);
      if (ok) await loadData();
      else alert('Erreur lors de la suppression.');
    }
  };

  const handleApproveVerification = async (photoId: string, userId: string) => {
    const ok = await approveVerification(photoId);
    if (ok) {
      await updateSupabaseProfile(userId, { isVerified: true });
      await loadData();
    } else {
      alert('Erreur lors de l\'approbation.');
    }
  };

  const handleRejectVerification = async (photoId: string) => {
    const ok = await rejectVerification(photoId);
    if (ok) await loadData();
    else alert('Erreur lors du rejet.');
  };

  // Filtered Users List
  const filteredUsers = usersList.filter((u) =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.location.toLowerCase().includes(userSearch.toLowerCase())
  );

  const totalRevenue = usersList.reduce((acc, u) => {
    if (u.subscriptionTier === 'PREMIUM_3M') return acc + 16;
    if (u.subscriptionTier === 'PREMIUM_12M') return acc + 25;
    if (u.subscriptionTier === 'PREMIUM_24M') return acc + 70;
    return acc;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1C102B] border border-[#2C1B3D] p-6 rounded-3xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <h1 className="text-2xl font-extrabold text-white">
                Panneau de Contrôle Administrateur
              </h1>
            </div>
            <p className="text-xs text-zinc-400">
              Gestion intégrale du site, édition des membres, contrôle des abonnements et groupes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-[#D4145A] text-white shadow-lg shadow-rose-900/40'
                  : 'bg-[#2C1B3D] text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Membres ({usersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'groups'
                  ? 'bg-[#D4145A] text-white shadow-lg shadow-rose-900/40'
                  : 'bg-[#2C1B3D] text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Clubs & Groupes ({groups.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'verification'
                  ? 'bg-[#D4145A] text-white shadow-lg shadow-rose-900/40'
                  : 'bg-[#2C1B3D] text-zinc-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Vérifications</span>
              {pendingVerifications.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-extrabold text-[10px] flex items-center justify-center">
                  {pendingVerifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-[#D4145A] text-white shadow-lg shadow-rose-900/40'
                  : 'bg-[#2C1B3D] text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Stats & Supabase</span>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="p-4 rounded-xl bg-[#1C102B] border border-[#2C1B3D] text-center text-xs text-zinc-400">Chargement des données...</div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Gestion & Édition des Membres</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2C1B3D] text-zinc-400">
                  {filteredUsers.length} affichés
                </span>
              </h2>

              <button
                onClick={loadData}
                className="px-3 py-2 rounded-xl bg-[#2C1B3D] hover:bg-[#3D2654] text-white text-xs font-bold"
              >
                Rafraîchir
              </button>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, ville..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[#1C102B] border border-[#2C1B3D] text-white text-xs pl-9 pr-4 py-2.5 rounded-xl focus:border-[#D4145A] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => {
                const isUserPremium = u.subscriptionTier !== 'FREE';

                return (
                  <div
                    key={u.id}
                    className="p-5 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] hover:border-zinc-700 transition-colors space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-[#2C1B3D]">
                            {u.photos?.[0]?.url ? (
                              <Image
                                src={u.photos[0].url}
                                alt={u.username}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs font-bold">
                                {u.username.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-white text-sm">{u.username}</h3>
                              {u.isVerified && (
                                <span title="Profil Vérifié">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                </span>
                              )}
                              {u.role === 'admin' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400">{u.email}</p>
                            <p className="text-[10px] text-zinc-500 capitalize">{u.gender} • {u.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                            isUserPremium
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {u.subscriptionTier}
                        </span>
                        {u.isVerified ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold">
                            Badge Vérifié
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                            Non vérifié
                          </span>
                        )}
                      </div>

                      {u.bio && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2 italic bg-[#12091A] p-2 rounded-lg border border-[#2C1B3D]">
                          &ldquo;{u.bio}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#2C1B3D] space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="py-1.5 px-3 rounded-lg bg-[#2C1B3D] hover:bg-purple-900/60 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Éditer</span>
                        </button>

                        <button
                          onClick={() => handleQuickToggleVerified(u)}
                          className={`py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors border ${
                            u.isVerified
                              ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{u.isVerified ? 'Dévérifier' : 'Vérifier'}</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleQuickUpgradeSubscription(
                              u,
                              u.subscriptionTier === 'FREE' ? 'PREMIUM_12M' : 'FREE'
                            )
                          }
                          className="flex-1 py-1.5 px-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 font-bold text-[11px] flex items-center justify-center gap-1"
                        >
                          <Crown className="w-3 h-3" />
                          <span>{u.subscriptionTier === 'FREE' ? 'Donner VIP 12M' : 'Basculer FREE'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                          title="Supprimer le membre"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GROUPS & CLUBS MANAGEMENT */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white">Gestion des Clubs & Groupes</h2>
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="px-4 py-2 rounded-xl bg-[#D4145A] hover:bg-[#b00f48] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un Club Officiel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="p-5 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-32 w-full rounded-xl overflow-hidden relative bg-[#2C1B3D]">
                      {g.coverUrl && (
                        <Image
                          src={g.coverUrl}
                          alt={g.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-bold">
                        {g.memberCount} / {g.maxMembers} membres
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-base">{g.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#2C1B3D] text-zinc-300 uppercase font-bold">
                          {g.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{g.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2C1B3D] flex gap-2">
                    <button
                      onClick={() => setEditingGroup(g)}
                      className="flex-1 py-2 rounded-xl bg-[#2C1B3D] hover:bg-purple-900/60 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Éditer Club</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(g.id)}
                      className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                      title="Supprimer le club"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VERIFICATION MODERATION */}
        {activeTab === 'verification' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">
              Demandes de Vérification d&apos;Identité en Attente ({pendingVerifications.length})
            </h2>

            {pendingVerifications.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] text-center text-xs text-zinc-400 space-y-2">
                <UserCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-white">Toutes les vérifications sont à jour !</p>
                <p>Aucune photo en attente d&apos;approbation pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingVerifications.map((v) => (
                  <div
                    key={v.id}
                    className="p-5 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm">{v.profiles?.username || 'Membre'}</h3>
                        <div className="text-xs text-zinc-400">{v.profiles?.email}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">
                        En attente
                      </span>
                    </div>

                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#3D2654] relative">
                      <Image
                        src={v.url}
                        alt="Selfie de vérification"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApproveVerification(v.id, v.user_id)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approuver</span>
                      </button>
                      <button
                        onClick={() => handleRejectVerification(v.id)}
                        className="py-2.5 px-3 rounded-xl bg-rose-950 text-rose-300 font-bold text-xs hover:bg-rose-900 border border-rose-800/60"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STATS & SUPABASE */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Revenu estimé (plans actifs)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{totalRevenue} €</div>
                <div className="text-[10px] text-zinc-500 font-semibold">Simulation basée sur les formules</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Membres Inscrits</span>
                  <Users className="w-4 h-4 text-[#E86B7A]" />
                </div>
                <div className="text-2xl font-extrabold text-white">{usersList.length} Membres</div>
                <div className="text-[10px] text-zinc-400">Taux de rétention 82%</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-2">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Taux de Profils Vérifiés</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {Math.round((usersList.filter((u) => u.isVerified).length / (usersList.length || 1)) * 100)} %
                </div>
                <div className="text-[10px] text-zinc-500 font-semibold">{usersList.filter((u) => u.isVerified).length} sur {usersList.length}</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-3">
              <h3 className="text-sm font-bold text-white">Répartition des Subscriptions Actives</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>Pass Privilège 12 Mois (Offre Populair) :</span>
                  <span className="font-bold text-white">
                    {usersList.filter((u) => u.subscriptionTier === 'PREMIUM_12M').length} membres
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Pass Épicurien 3 Mois :</span>
                  <span className="font-bold text-white">
                    {usersList.filter((u) => u.subscriptionTier === 'PREMIUM_3M').length} membres
                  </span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Pass VIP Elite 24 Mois :</span>
                  <span className="font-bold text-white">
                    {usersList.filter((u) => u.subscriptionTier === 'PREMIUM_24M').length} membres
                  </span>
                </div>
              </div>
            </div>

            {/* Supabase Status & SQL Schema Card */}
            <div className="p-6 rounded-2xl bg-[#1C102B] border border-emerald-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <h3 className="text-sm font-bold text-white">Base de Données Supabase</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                  Connecté & En Ligne
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono bg-[#12091A] p-3 rounded-xl border border-[#2C1B3D]">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Project Ref:</span>
                  <span className="text-emerald-400">{process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '') || 'Non configuré'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Endpoint API:</span>
                  <span className="text-zinc-300 truncate block">{process.env.NEXT_PUBLIC_SUPABASE_URL || 'Non configuré'}</span>
                </div>
              </div>

              {/* SQL Schema Preview & Copy */}
              <div className="space-y-2 pt-2 border-t border-[#2C1B3D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">Script SQL pour Création des Tables Supabase</span>
                  <button
                    onClick={() => {
                      import('@/lib/supabase').then(({ SUPABASE_SQL_SCHEMA }) => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                        alert('Script SQL des tables Supabase copié dans le presse-papier !');
                      });
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold border border-emerald-800/60 transition-colors"
                  >
                    Copier le Script SQL
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Exécutez ce script dans l&apos;éditeur SQL de votre console Supabase (<code className="text-emerald-400">SQL Editor</code>) pour initialiser toutes les tables (profiles, photos, groups, messages, subscriptions).
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C102B] border border-[#2C1B3D] rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b border-[#2C1B3D] pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#D4145A]" />
                <span>Éditer le Membre : {editingUser.username}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Nom d&apos;utilisateur</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">E-mail</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Genre / Type</label>
                  <select
                    value={editingUser.gender}
                    onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value as GenderType })}
                    className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  >
                    <option value="couple">Couple</option>
                    <option value="homme">Homme Solo</option>
                    <option value="femme">Femme Solo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Rôle</label>
                  <select
                    value={editingUser.role || 'user'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                    className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  >
                    <option value="user">Membre Standard</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Formule d&apos;Abonnement</label>
                <select
                  value={editingUser.subscriptionTier}
                  onChange={(e) => setEditingUser({ ...editingUser, subscriptionTier: e.target.value as SubscriptionTier })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                >
                  <option value="FREE">Gratuit (FREE)</option>
                  <option value="PREMIUM_3M">3 Mois Épicurien</option>
                  <option value="PREMIUM_12M">12 Mois Privilège</option>
                  <option value="PREMIUM_24M">24 Mois VIP Elite</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Ville / Localisation</label>
                <input
                  type="text"
                  value={editingUser.location}
                  onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Bio / Présentation</label>
                <textarea
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isVerifiedCheck"
                  checked={editingUser.isVerified}
                  onChange={(e) => setEditingUser({ ...editingUser, isVerified: e.target.checked })}
                  className="accent-[#D4145A] w-4 h-4 rounded"
                />
                <label htmlFor="isVerifiedCheck" className="text-xs text-zinc-300 font-bold">
                  Accorder le Badge Profil Vérifié (Coche Verte)
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2C1B3D] hover:bg-zinc-800 text-zinc-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D4145A] hover:bg-[#b00f48] text-white font-bold shadow-lg"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {isCreatingGroup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C102B] border border-[#2C1B3D] rounded-3xl p-6 max-w-lg w-full space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#2C1B3D] pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4145A]" />
                <span>Créer un Nouveau Club Officiel</span>
              </h3>
              <button
                onClick={() => setIsCreatingGroup(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Nom du Club / Groupe</label>
                <input
                  type="text"
                  placeholder="Ex: Soirées Privées Paris"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Catégorie</label>
                <select
                  value={newGroupData.category}
                  onChange={(e) => setNewGroupData({ ...newGroupData, category: e.target.value })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                >
                  <option value="clubs">Clubs & Établissements</option>
                  <option value="soirees">Soirées & Événements</option>
                  <option value="discression">Discrétion & Voyages</option>
                  <option value="rencontres">Rencontres Thématiques</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Description</label>
                <textarea
                  placeholder="Présentez l'objectif du club..."
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">URL de l&apos;Image de Couverture</label>
                <input
                  type="url"
                  value={newGroupData.coverUrl}
                  onChange={(e) => setNewGroupData({ ...newGroupData, coverUrl: e.target.value })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Nombre Max de Membres</label>
                  <input
                    type="number"
                    value={newGroupData.maxMembers}
                    onChange={(e) => setNewGroupData({ ...newGroupData, maxMembers: Number(e.target.value) })}
                    className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  />
                </div>

                <div className="flex items-end mb-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input
                      type="checkbox"
                      checked={newGroupData.isPrivate}
                      onChange={(e) => setNewGroupData({ ...newGroupData, isPrivate: e.target.checked })}
                      className="accent-[#D4145A] w-4 h-4 rounded"
                    />
                    <span>Groupe Privé</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingGroup(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2C1B3D] hover:bg-zinc-800 text-zinc-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D4145A] hover:bg-[#b00f48] text-white font-bold shadow-lg"
                >
                  Créer le Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GROUP MODAL */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C102B] border border-[#2C1B3D] rounded-3xl p-6 max-w-lg w-full space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#2C1B3D] pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#D4145A]" />
                <span>Éditer le Club : {editingGroup.name}</span>
              </h3>
              <button
                onClick={() => setEditingGroup(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroupEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Nom du Club</label>
                <input
                  type="text"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Description</label>
                <textarea
                  value={editingGroup.description || ''}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">URL Couverture</label>
                <input
                  type="url"
                  value={editingGroup.coverUrl || ''}
                  onChange={(e) => setEditingGroup({ ...editingGroup, coverUrl: e.target.value })}
                  className="w-full bg-[#12091A] border border-[#2C1B3D] text-white p-2.5 rounded-xl outline-none focus:border-[#D4145A]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2C1B3D] hover:bg-zinc-800 text-zinc-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D4145A] hover:bg-[#b00f48] text-white font-bold shadow-lg"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
