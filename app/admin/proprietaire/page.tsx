'use client';

import React, { useEffect, useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import {
  Lock,
  Crown,
  Users,
  CreditCard,
  Ban,
  TrendingUp,
  AlertCircle,
  Clock,
} from 'lucide-react';

type Abonnements = {
  repartition: Record<string, number>;
  actifs: number;
  gratuits: number;
  revenuMensuelRecurrent: number;
  expirentBientot: Array<{
    id: string;
    email: string;
    subscriptionTier: string;
    subscriptionEnd: string;
  }>;
};

type Visites = {
  inscriptions30Jours: number;
  connexions30Jours: number;
  actifs24h: number;
  actifs7Jours: number;
  parJour: Array<{ date: string; inscriptions: number; connexions: number }>;
  dernieresInscriptions: Array<{
    id: string;
    email: string;
    username: string;
    subscriptionTier: string;
    createdAt: string;
    lastLoginAt: string | null;
  }>;
};

type Paiements = {
  disponible: boolean;
  total: number;
  reussis: number;
  echoues: number;
  chiffreAffairesTotal: number;
  chiffreAffaires30Jours: number;
  derniers: Array<{
    id: string;
    montant: number;
    devise: string;
    statut: string;
    date: string;
    email: string | null;
  }>;
};

type Blocages = {
  totalBannis: number;
  bannis: Array<{ id: string; email: string; username: string }>;
  actionsRecentes: Array<{
    action: string;
    adminId: string;
    targetId: string;
    reason: string;
    timestamp: string;
  }>;
  journalDisponible: boolean;
};

type Donnees = {
  genereLe: string;
  abonnements: Abonnements;
  visites: Visites;
  paiements: Paiements;
  blocages: Blocages;
};

const NOM_OFFRE: Record<string, string> = {
  FREE: 'Gratuit',
  PREMIUM_3M: 'Premium 3 mois',
  PREMIUM_12M: 'Premium 12 mois',
  PREMIUM_24M: 'Premium 24 mois',
  CREATOR_3M: 'Créateur 3 mois',
  CREATOR_12M: 'Créateur 12 mois',
  VIP_24M: 'VIP 24 mois',
};

function formatEuros(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function joursRestants(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function OwnerDashboardPage() {
  const [accesRefuse, setAccesRefuse] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [donnees, setDonnees] = useState<Donnees | null>(null);
  const [onglet, setOnglet] = useState<'abonnements' | 'visites' | 'paiements' | 'blocages'>(
    'abonnements'
  );

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await fetchResilient('/api/admin/owner-dashboard');
        if (res.status === 401 || res.status === 403) {
          setAccesRefuse(true);
          return;
        }
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setErreur(d.error ?? 'Erreur lors du chargement du tableau de bord');
          return;
        }
        setDonnees(await res.json());
      } catch {
        setErreur('Erreur réseau. Vérifiez votre connexion.');
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#12091A] flex items-center justify-center">
        <Navbar />
        <div className="text-zinc-400">Chargement du tableau de bord...</div>
      </div>
    );
  }

  if (accesRefuse) {
    return (
      <div className="min-h-screen bg-[#12091A]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center space-y-4">
            <Lock className="w-12 h-12 text-[#D4145A] mx-auto" />
            <h1 className="text-3xl font-bold text-white">Accès refusé</h1>
            <p className="text-zinc-400">Cette page est réservée au propriétaire du site.</p>
            <Link href="/" className="inline-block mt-4 px-6 py-3 bg-[#D4145A] text-white rounded-lg">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (erreur || !donnees) {
    return (
      <div className="min-h-screen bg-[#12091A]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="w-12 h-12 text-[#D4145A] mx-auto" />
            <h1 className="text-2xl font-bold text-white">Impossible de charger le tableau de bord</h1>
            <p className="text-zinc-400 text-sm">{erreur}</p>
          </div>
        </div>
      </div>
    );
  }

  const { abonnements, visites, paiements, blocages } = donnees;
  const maxParJour = Math.max(
    1,
    ...visites.parJour.map((j) => j.inscriptions + j.connexions)
  );

  return (
    <div className="min-h-screen bg-[#12091A]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Crown className="w-8 h-8 text-[#D4145A]" />
            Tableau de bord propriétaire
          </h1>
          <p className="text-zinc-400 mt-1">
            Généré le {new Date(donnees.genereLe).toLocaleString('fr-FR')}
          </p>
        </div>

        {/* Résumé en un coup d'œil */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ResumeCard
            icon={<Crown className="w-5 h-5 text-[#D4145A]" />}
            label="Abonnés actifs"
            valeur={abonnements.actifs}
          />
          <ResumeCard
            icon={<TrendingUp className="w-5 h-5 text-[#D4145A]" />}
            label="Revenu récurrent / mois"
            valeur={formatEuros(abonnements.revenuMensuelRecurrent)}
          />
          <ResumeCard
            icon={<Users className="w-5 h-5 text-[#D4145A]" />}
            label="Actifs (24h)"
            valeur={visites.actifs24h}
          />
          <ResumeCard
            icon={<Ban className="w-5 h-5 text-[#D4145A]" />}
            label="Comptes bannis"
            valeur={blocages.totalBannis}
          />
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b border-[#2C1B3D] overflow-x-auto">
          {(
            [
              ['abonnements', 'Abonnements', Crown],
              ['visites', 'Visites', Users],
              ['paiements', 'Paiements', CreditCard],
              ['blocages', 'Blocages', Ban],
            ] as const
          ).map(([cle, label, Icone]) => (
            <button
              key={cle}
              onClick={() => setOnglet(cle)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                onglet === cle
                  ? 'border-[#D4145A] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icone className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {onglet === 'abonnements' && (
          <div className="space-y-6">
            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <h2 className="text-lg font-bold text-white mb-4">Répartition par offre</h2>
              <div className="space-y-3">
                {Object.entries(abonnements.repartition)
                  .sort((a, b) => b[1] - a[1])
                  .map(([offre, total]) => {
                    const totalGeneral = Object.values(abonnements.repartition).reduce(
                      (a, b) => a + b,
                      0
                    );
                    const pct = totalGeneral ? Math.round((total / totalGeneral) * 100) : 0;
                    return (
                      <div key={offre}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">{NOM_OFFRE[offre] ?? offre}</span>
                          <span className="text-zinc-500">
                            {total} ({pct} %)
                          </span>
                        </div>
                        <div className="h-2 bg-[#2C1B3D] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D4145A] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D4145A]" />
                Expirent dans les 7 prochains jours
              </h2>
              {abonnements.expirentBientot.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucun abonnement n'expire cette semaine.</p>
              ) : (
                <div className="space-y-2">
                  {abonnements.expirentBientot.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between py-2 px-3 bg-[#12091A] rounded-lg text-sm"
                    >
                      <div>
                        <p className="text-white">{u.email}</p>
                        <p className="text-zinc-500 text-xs">
                          {NOM_OFFRE[u.subscriptionTier] ?? u.subscriptionTier}
                        </p>
                      </div>
                      <span className="text-[#D4145A] font-medium">
                        {joursRestants(u.subscriptionEnd)} j
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {onglet === 'visites' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResumeCard label="Inscriptions (30j)" valeur={visites.inscriptions30Jours} />
              <ResumeCard label="Connexions (30j)" valeur={visites.connexions30Jours} />
              <ResumeCard label="Actifs (24h)" valeur={visites.actifs24h} />
              <ResumeCard label="Actifs (7j)" valeur={visites.actifs7Jours} />
            </div>

            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <h2 className="text-lg font-bold text-white mb-4">Activité des 30 derniers jours</h2>
              <div className="flex items-end gap-1 h-40">
                {visites.parJour.map((j) => {
                  const total = j.inscriptions + j.connexions;
                  const hauteur = Math.max(2, (total / maxParJour) * 100);
                  return (
                    <div
                      key={j.date}
                      className="flex-1 flex flex-col justify-end group relative"
                      title={`${j.date}: ${j.inscriptions} inscriptions, ${j.connexions} connexions`}
                    >
                      <div
                        className="bg-[#D4145A] rounded-t opacity-70 group-hover:opacity-100 transition"
                        style={{ height: `${hauteur}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>{visites.parJour[0]?.date}</span>
                <span>{visites.parJour[visites.parJour.length - 1]?.date}</span>
              </div>
            </div>

            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <h2 className="text-lg font-bold text-white mb-4">Dernières inscriptions</h2>
              {visites.dernieresInscriptions.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucune inscription enregistrée.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-500 border-b border-[#2C1B3D]">
                        <th className="pb-2 pr-4">Membre</th>
                        <th className="pb-2 pr-4">Offre</th>
                        <th className="pb-2 pr-4">Inscrit le</th>
                        <th className="pb-2">Dernière connexion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visites.dernieresInscriptions.map((u) => (
                        <tr key={u.id} className="border-b border-[#2C1B3D]/50">
                          <td className="py-2 pr-4">
                            <p className="text-white">{u.username}</p>
                            <p className="text-zinc-500 text-xs">{u.email}</p>
                          </td>
                          <td className="py-2 pr-4 text-zinc-300">
                            {NOM_OFFRE[u.subscriptionTier] ?? u.subscriptionTier}
                          </td>
                          <td className="py-2 pr-4 text-zinc-400">{formatDate(u.createdAt)}</td>
                          <td className="py-2 text-zinc-400">
                            {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Jamais'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {onglet === 'paiements' && (
          <div className="space-y-6">
            {!paiements.disponible && (
              <div className="bg-[#1C102B] border border-[#D4145A]/40 rounded-lg p-4 flex items-center gap-3 text-sm text-zinc-300">
                <AlertCircle className="w-5 h-5 text-[#D4145A] flex-shrink-0" />
                La table des paiements n'est pas encore configurée. Les données ci-dessous seront
                vides tant que Stripe n'aura pas enregistré de transaction.
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResumeCard label="Chiffre d'affaires total" valeur={formatEuros(paiements.chiffreAffairesTotal)} />
              <ResumeCard label="Chiffre d'affaires (30j)" valeur={formatEuros(paiements.chiffreAffaires30Jours)} />
              <ResumeCard label="Transactions réussies" valeur={paiements.reussis} />
              <ResumeCard label="Transactions échouées" valeur={paiements.echoues} />
            </div>

            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <h2 className="text-lg font-bold text-white mb-4">Dernières transactions</h2>
              {paiements.derniers.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucune transaction enregistrée.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-500 border-b border-[#2C1B3D]">
                        <th className="pb-2 pr-4">Date</th>
                        <th className="pb-2 pr-4">Membre</th>
                        <th className="pb-2 pr-4">Montant</th>
                        <th className="pb-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paiements.derniers.map((t) => (
                        <tr key={t.id} className="border-b border-[#2C1B3D]/50">
                          <td className="py-2 pr-4 text-zinc-300">{formatDate(t.date)}</td>
                          <td className="py-2 pr-4 text-zinc-300">
                            {t.email ?? <span className="text-zinc-600">inconnu</span>}
                          </td>
                          <td className="py-2 pr-4 text-white font-medium">
                            {t.montant.toLocaleString('fr-FR', { style: 'currency', currency: t.devise })}
                          </td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                t.statut === 'succeeded'
                                  ? 'bg-green-900/40 text-green-400'
                                  : 'bg-red-900/40 text-red-400'
                              }`}
                            >
                              {t.statut === 'succeeded' ? 'Réussi' : 'Échoué'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {onglet === 'blocages' && (
          <div className="space-y-6">
            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Ban className="w-5 h-5 text-[#D4145A]" />
                Comptes bannis ({blocages.totalBannis})
              </h2>
              {blocages.bannis.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucun compte banni actuellement.</p>
              ) : (
                <div className="space-y-2">
                  {blocages.bannis.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between py-2 px-3 bg-[#12091A] rounded-lg text-sm"
                    >
                      <div>
                        <p className="text-white">{u.username}</p>
                        <p className="text-zinc-500 text-xs">{u.email}</p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-900/40 text-red-400">
                        Banni
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/admin"
                className="inline-block mt-4 text-sm text-[#D4145A] hover:underline"
              >
                Gérer les utilisateurs →
              </Link>
            </div>

            <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-6">
              <h2 className="text-lg font-bold text-white mb-4">Actions d'administration récentes</h2>
              {!blocages.journalDisponible ? (
                <p className="text-zinc-500 text-sm">Le journal d'administration n'est pas encore configuré.</p>
              ) : blocages.actionsRecentes.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucune action récente.</p>
              ) : (
                <div className="space-y-2">
                  {blocages.actionsRecentes.map((a, i) => (
                    <div key={i} className="py-2 px-3 bg-[#12091A] rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="text-white font-medium">{a.action}</span>
                        <span className="text-zinc-500 text-xs">
                          {formatDate(a.timestamp)}
                        </span>
                      </div>
                      {a.reason && <p className="text-zinc-500 text-xs mt-1">{a.reason}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeCard({
  icon,
  label,
  valeur,
}: {
  icon?: React.ReactNode;
  label: string;
  valeur: string | number;
}) {
  return (
    <div className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] p-4">
      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold text-white">{valeur}</p>
    </div>
  );
}
