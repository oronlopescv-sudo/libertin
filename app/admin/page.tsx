'use client';

import React, { useEffect, useState } from 'react';
import { isAdmin as isAdminUser } from '@/lib/premium';
import { Navbar } from '@/components/navbar';
import { Users, Zap, MessageSquare, Heart, TrendingUp, Ban, Lock, Crown } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  tierBreakdown: Record<string, number>;
  totalGroups: number;
  totalMessages: number;
  totalLikes: number;
  onlineUsers: number;
  newUsersThisMonth: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  subscriptionTier: string;
  subscriptionEnd: string | null;
  isVerified: boolean;
  createdAt: string;
  isBanned: boolean;
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Verificar se é admin
        const token = localStorage.getItem('auth_token');
        if (token) {
          const userData = JSON.parse(Buffer.from(token, 'base64').toString());
          setUser(userData);
        }

        // Carregar stats
        const statsRes = await fetch('/api/admin/dashboard');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Carregar users
        const usersRes = await fetch(`/api/admin/users?page=${page}&search=${search}`);
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users);
          setTotalPages(usersData.pagination.pages);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [page, search]);

  const banUser = async (userId: string, reason: string) => {
    if (!confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) return;

    const res = await fetch('/api/admin/users/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason }),
    });

    if (res.ok) {
      // Recarregar users
      const usersRes = await fetch(`/api/admin/users?page=${page}`);
      const usersData = await usersRes.json();
      setUsers(usersData.users);
    }
  };

  const unbanUser = async (userId: string) => {
    if (!confirm('Débannir cet utilisateur ?')) return;

    const res = await fetch(`/api/admin/users?userId=${userId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      // Recarregar users
      const usersRes = await fetch(`/api/admin/users?page=${page}`);
      const usersData = await usersRes.json();
      setUsers(usersData.users);
    }
  };

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

  if (!isAdminUser(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center space-y-4">
            <Lock className="w-12 h-12 text-[#D4145A] mx-auto" />
            <h1 className="text-3xl font-bold text-white">Accès refusé</h1>
            <p className="text-zinc-400">Seuls les administrateurs peuvent accéder à ce panneau</p>
            <Link href="/" className="inline-block mt-4 px-6 py-3 bg-[#D4145A] text-white rounded-lg">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Panneau Admin</h1>
            <p className="text-zinc-400">Gérez les utilisateurs, les groupes et surveillez la plateforme</p>
          </div>
          <Link
            href="/admin/proprietaire"
            className="flex items-center gap-2 px-4 py-3 bg-[#D4145A] text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            <Crown className="w-4 h-4" />
            Tableau de bord propriétaire
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Users */}
            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total de Utilisateurs</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-[#D4145A] opacity-50" />
              </div>
              <p className="text-green-400 text-sm mt-2">+{stats.newUsersThisMonth} este mois</p>
            </div>

            {/* Online Users */}
            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Online Agora</p>
                  <p className="text-3xl font-bold text-white">{stats.onlineUsers}</p>
                </div>
                <Zap className="w-12 h-12 text-green-400 opacity-50" />
              </div>
              <p className="text-green-400 text-sm mt-2">Últimos 5 minutes</p>
            </div>

            {/* Total Groups */}
            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Groupes Ativos</p>
                  <p className="text-3xl font-bold text-white">{stats.totalGroups}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-400 opacity-50" />
              </div>
              <p className="text-blue-400 text-sm mt-2">Communautés</p>
            </div>

            {/* Total Likes */}
            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Interactions (Likes)</p>
                  <p className="text-3xl font-bold text-white">{stats.totalLikes}</p>
                </div>
                <Heart className="w-12 h-12 text-red-400 opacity-50" />
              </div>
              <p className="text-red-400 text-sm mt-2">Total</p>
            </div>
          </div>
        )}

        {/* Abonnement Breakdown */}
        {stats && (
          <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Utilisateurs par abonnement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.tierBreakdown).map(([tier, count]) => (
                <div key={tier} className="bg-[#2C1B3D] rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">{tier}</p>
                  <p className="text-2xl font-bold text-white">{count as number}</p>
                  <p className="text-xs text-zinc-500 mt-2">
                    {((((count as number) / stats.totalUsers) * 100).toFixed(1))}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Management */}
        <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Gestion des utilisateurs</h2>

          {/* Search */}
          <input
            type="text"
            placeholder="Rechercher por username ou email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full mb-4 px-4 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
          />

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2C1B3D]">
                  <th className="text-left py-3 px-4 text-zinc-400">Username</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Email</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Abonnement</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Status</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#2C1B3D] hover:bg-[#2C1B3D]/50">
                    <td className="py-3 px-4 text-white font-medium">{u.username}</td>
                    <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.subscriptionTier === 'FREE' ? 'bg-zinc-600 text-zinc-200' :
                        u.subscriptionTier === 'PREMIUM_3M' ? 'bg-blue-600 text-blue-100' :
                        u.subscriptionTier === 'PREMIUM_12M' ? 'bg-purple-600 text-purple-100' :
                        'bg-yellow-600 text-yellow-100'
                      }`}>
                        {u.subscriptionTier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.isBanned ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-red-100">
                          BANIDO
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600 text-green-100">
                          ATIVO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.isBanned ? (
                        <button
                          onClick={() => unbanUser(u.id)}
                          className="text-green-400 hover:text-green-300 text-xs font-semibold"
                        >
                          Desbannir
                        </button>
                      ) : (
                        <button
                          onClick={() => banUser(u.id, 'Violation des conditions')}
                          className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1"
                        >
                          <Ban className="w-4 h-4" /> Bannir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginaction */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#2C1B3D] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-white">Page {page} de {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#2C1B3D] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>

        {/* Sections à venir — pages pas encore créées, affichées comme
            indisponibles plutôt que comme des liens qui mènent à une 404. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6 text-white opacity-50 cursor-not-allowed">
            <h3 className="text-lg font-bold mb-2">Gestion des groupes</h3>
            <p className="text-zinc-400 text-sm">Voir et gérer tous les groupes</p>
            <span className="inline-block mt-3 text-xs text-zinc-500 uppercase tracking-wide">Bientôt disponible</span>
          </div>
          <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6 text-white opacity-50 cursor-not-allowed">
            <h3 className="text-lg font-bold mb-2">Journal d'activité</h3>
            <p className="text-zinc-400 text-sm">Voir l'historique des actions</p>
            <span className="inline-block mt-3 text-xs text-zinc-500 uppercase tracking-wide">Bientôt disponible</span>
          </div>
          <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6 text-white opacity-50 cursor-not-allowed">
            <h3 className="text-lg font-bold mb-2">Rapports</h3>
            <p className="text-zinc-400 text-sm">Générer des rapports détaillés</p>
            <span className="inline-block mt-3 text-xs text-zinc-500 uppercase tracking-wide">Bientôt disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
