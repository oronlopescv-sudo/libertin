'use client';

import React, { useEffect, useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import { Navbar } from '@/components/navbar';
import { VerificationQueuePanel } from '@/components/admin-verification-queue';
import { Users, Zap, Heart, TrendingUp, Ban, Lock, Crown, ShieldCheck, X, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

const PLANOS_PREMIUM = [
  { id: 'PASS_EPICURIEN', nome: 'Pass Épicurien', preco: '9 € / mois' },
  { id: 'PASS_PRIVILEGE', nome: 'Pass Privilège', preco: '15 € / mois' },
  { id: 'PASS_VIP', nome: 'Pass VIP Elite', preco: '25 € / mois' },
] as const;

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
  // Utilisateur connecté depuis le contexte d'authentification (Supabase Auth).
  // L'ancienne version lisait `localStorage.auth_token` (base64 + Buffer) :
  // jeton mort, jamais écrit, et Buffer indéfini dans le navigateur — un admin
  // connecté voyait donc « Accès refusé ».
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Charger les stats
        const statsRes = await fetchResilient('/api/admin/dashboard');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Charger les utilisateurs
        const usersRes = await fetchResilient(`/api/admin/users?page=${page}&search=${search}`);
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

  // Confirmations via un modal intégré à la page. Remplacent les confirm()/
  // prompt()/alert() natifs (laids, bloquants et incohérents avec l'interface).
  const [acao, setAcao] = useState<null | {
    tipo: 'ban' | 'unban' | 'grant' | 'reset';
    userId: string;
    username: string;
    tierAtual: string;
  }>(null);
  const [motivo, setMotivo] = useState('Violation des conditions');
  const [plano, setPlano] = useState<'PASS_EPICURIEN' | 'PASS_PRIVILEGE' | 'PASS_VIP'>(
    'PASS_PRIVILEGE'
  );
  const [meses, setMeses] = useState(1);
  // senhaNova: apenas a ação «reset» — vazia = o servidor gera uma
  // temporária e a devolve na resposta para passar ao membro.
  const [senhaNova, setSenhaNova] = useState('');
  const [processando, setProcessando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const prepararAcao = (tipo: 'ban' | 'unban' | 'grant' | 'reset', u: AdminUser) => {
    setFeedback(null);
    setMotivo('Violation des conditions');
    setPlano('PASS_PRIVILEGE');
    setMeses(1);
    setSenhaNova('');
    setAcao({ tipo, userId: u.id, username: u.username, tierAtual: u.subscriptionTier });
  };

  const recarregarUsuarios = async () => {
    const usersRes = await fetchResilient(`/api/admin/users?page=${page}`);
    if (usersRes.ok) {
      const usersData = await usersRes.json();
      setUsers(usersData.users);
    }
  };

  // Activer (ou renouveler) un forfait mensuel Premium pour un utilisateur,
  // sans passer par Stripe. L'admin choisit le forfait et la durée de la
  // courtoisie en mois depuis le modal.
  const executarAcao = async () => {
    if (!acao) return;
    setProcessando(true);
    try {
      let res: Response;
      if (acao.tipo === 'ban') {
        res = await fetchResilient('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: acao.userId,
            reason: motivo.trim() || 'Violation des conditions',
          }),
        });
      } else if (acao.tipo === 'unban') {
        res = await fetchResilient(`/api/admin/users?userId=${acao.userId}`, {
          method: 'DELETE',
        });
      } else if (acao.tipo === 'reset') {
        res = await fetchResilient('/api/admin/users/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: acao.userId, newPassword: senhaNova.trim() }),
        });
      } else {
        res = await fetchResilient('/api/admin/users/grant-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: acao.userId, plan: plano, months: meses }),
        });
      }

      if (res.ok) {
        if (acao.tipo === 'reset') {
          // A senha gerada VEM apenas nesta resposta — é ela que o admin
          // passa ao membro por canal privado (nada de email nem logs).
          const dados = await res.json();
          const senhaRevelada = dados.gerada ? dados.password : senhaNova.trim();
          setFeedback({
            tipo: 'ok',
            texto: `Password reposta — ${acao.username} entra agora com : ${senhaRevelada} (passa-lhe por canal privado; não sai por email).`,
          });
        } else {
          const textos = {
            ban: `${acao.username} a été banni.`,
            unban: `${acao.username} a été réactivé.`,
            grant: `${plano} activé pour ${meses} mois — ${acao.username}.`,
          };
          setFeedback({ tipo: 'ok', texto: textos[acao.tipo] });
        }
        setAcao(null);
        await recarregarUsuarios();
      } else {
        const err = await res.json().catch(() => ({}));
        setFeedback({
          tipo: 'erro',
          texto: err.error ?? "Échec de l'action — réessayez.",
        });
      }
    } catch {
      setFeedback({
        tipo: 'erro',
        texto: 'Erreur réseau. Vérifiez votre connexion et réessayez.',
      });
    } finally {
      setProcessando(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-white">
          Chargement...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
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
                  <p className="text-zinc-400 text-sm">Total d'utilisateurs</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-[#D4145A] opacity-50" />
              </div>
              <p className="text-green-400 text-sm mt-2">+{stats.newUsersThisMonth} ce mois</p>
            </div>

            {/* Online Users */}
            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">En ligne maintenant</p>
                  <p className="text-3xl font-bold text-white">{stats.onlineUsers}</p>
                </div>
                <Zap className="w-12 h-12 text-green-400 opacity-50" />
              </div>
              <p className="text-green-400 text-sm mt-2">Dernières 5 minutes</p>
            </div>

            {/* Total Groups */}
            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Groupes actifs</p>
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
            placeholder="Rechercher par username ou email..."
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
                  <th className="text-left py-3 px-4 text-zinc-400">Statut</th>
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
                        u.subscriptionTier === 'PASS_EPICURIEN' ? 'bg-blue-600 text-blue-100' :
                        u.subscriptionTier === 'PASS_PRIVILEGE' ? 'bg-purple-600 text-purple-100' :
                        'bg-yellow-600 text-yellow-100'
                      }`}>
                        {u.subscriptionTier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.isBanned ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-red-100">
                          BANNI
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600 text-green-100">
                          ACTIF
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {u.isBanned ? (
                          <button
                            onClick={() => prepararAcao('unban', u)}
                            className="text-green-400 hover:text-green-300 text-xs font-semibold"
                          >
                            Débannir
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => prepararAcao('grant', u)}
                              className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold flex items-center gap-1"
                            >
                              <Crown className="w-4 h-4" />
                              {u.subscriptionTier && u.subscriptionTier !== 'FREE' ? 'Renouveler Premium' : 'Activer Premium'}
                            </button>
                            <button
                              onClick={() => prepararAcao('reset', u)}
                              className="text-[#E86B7A] hover:text-[#D4145A] text-xs font-semibold flex items-center gap-1"
                            >
                              <KeyRound className="w-4 h-4" /> Repor password
                            </button>
                            <button
                              onClick={() => prepararAcao('ban', u)}
                              className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1"
                            >
                              <Ban className="w-4 h-4" /> Bannir
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

        {/* Vérification des photos — file d'attente des selfies de vérification.
            Les actions passent par /api/admin/verifications (gate serveur). */}
        <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D4145A]" />
            Vérification des photos
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Approuvez ou rejetez les selfies envoyés par les utilisateurs pour le badge vérifié.
          </p>
          <VerificationQueuePanel />
        </div>
      </div>

      {/* Toast de succès / erreur (remplace les alert() natifs) */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl text-sm shadow-xl flex items-start justify-between gap-3 backdrop-blur-sm ${
            feedback.tipo === 'ok'
              ? 'bg-emerald-950/90 border border-emerald-800/50 text-emerald-200'
              : 'bg-rose-950/90 border border-rose-800/50 text-rose-200'
          }`}
        >
          <span>{feedback.texto}</span>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:text-white shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal de confirmation — bannissement, réactivation, Premium */}
      {acao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#1C102B] border border-[#3D2654] rounded-2xl shadow-2xl p-6 text-white space-y-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold leading-snug">
                {acao.tipo === 'ban' && (
                  <>
                    Bannir « {acao.username} »
                  </>
                )}
                {acao.tipo === 'unban' && (
                  <>
                    Débannir « {acao.username} »
                  </>
                )}
                {acao.tipo === 'grant' && (
                  <>
                    {acao.tierAtual && acao.tierAtual !== 'FREE'
                      ? 'Renouveler Premium — '
                      : 'Activer Premium — '}
                    {acao.username}
                  </>
                )}
                {acao.tipo === 'reset' && (
                  <>
                    Repor password — {acao.username}
                  </>
                )}
              </h3>
              <button
                onClick={() => setAcao(null)}
                disabled={processando}
                className="p-2 rounded-full bg-[#2C1B3D] text-zinc-400 hover:text-white disabled:opacity-50"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {acao.tipo === 'ban' && (
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">
                  L&apos;utilisateur perdra immédiatement l&apos;accès à la plateforme.
                </p>
                <label className="text-xs text-zinc-400 block">
                  Motif du bannissement (consigné pour la modération)
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder="Ex: Harcèlement signalé par 3 membres..."
                  className="w-full p-3 bg-[#12091A] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4145A] text-sm"
                />
              </div>
            )}

            {acao.tipo === 'unban' && (
              <p className="text-sm text-zinc-400">
                L&apos;utilisateur retrouvera l&apos;accès à la plateforme. Confirmer ?
              </p>
            )}

            {acao.tipo === 'reset' && (
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">
                  Para o membro bloqueado enquanto o envio de e-mails não funciona: define a
                  nova password, ele entra com ela e troca depois no perfil.
                </p>
                <label className="text-xs text-zinc-400 block">
                  Nova password — deixada vazia, gera uma temporária automaticamente (aparece
                  no toast, cópia-a e passa ao membro)
                </label>
                <input
                  type="text"
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                  placeholder='Vazio = gerar — ex: "NovaSenhaE2e2026!"'
                  autoComplete="off"
                  className="w-full p-3 bg-[#12091A] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4145A] text-sm"
                />
              </div>
            )}

            {acao.tipo === 'grant' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 block">Forfait de courtoisie</label>
                  {PLANOS_PREMIUM.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        plano === p.id
                          ? 'border-[#D4145A] bg-[#D4145A]/10'
                          : 'border-[#2C1B3D] bg-[#12091A] hover:border-[#D4145A]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plano"
                        value={p.id}
                        checked={plano === p.id}
                        onChange={() => setPlano(p.id)}
                        className="w-4 h-4"
                      />
                      <span className="flex-1 text-sm font-semibold text-white">{p.nome}</span>
                      <span className="text-xs text-zinc-400">{p.preco}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 block">
                    Durée de la courtoisie (en mois)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={meses}
                    onChange={(e) => setMeses(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-28 px-3 py-2 bg-[#12091A] border border-[#2C1B3D] rounded-lg text-white focus:outline-none focus:border-[#D4145A] text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setAcao(null)}
                disabled={processando}
                className="flex-1 py-2.5 px-3 bg-[#2C1B3D] text-white rounded-lg font-bold text-sm hover:bg-[#3D2654] disabled:opacity-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={executarAcao}
                disabled={processando || (acao.tipo === 'ban' && !motivo.trim())}
                className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
                  acao.tipo === 'ban'
                    ? 'bg-red-950/80 border border-red-800/40 text-red-300 hover:bg-red-950'
                    : 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white hover:opacity-95'
                }`}
              >
                {processando ? (
                  'Traitement…'
                ) : acao.tipo === 'ban' ? (
                  'Confirmer le bannissement'
                ) : acao.tipo === 'unban' ? (
                  'Confirmer la réactivation'
                ) : (
                  `Confirmer — ${meses} mois`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
