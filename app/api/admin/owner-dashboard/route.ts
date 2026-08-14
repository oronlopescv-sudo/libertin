import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin as isAdminUser } from '@/lib/premium';
import { cookies } from 'next/headers';

/**
 * Tableau de bord propriétaire.
 *
 * Rassemble en une seule requête les quatre volets demandés :
 *   - abonnements  : répartition, revenus récurrents, expirations proches
 *   - visites      : inscriptions et connexions sur 30 jours
 *   - paiements    : transactions réussies / échouées, chiffre d'affaires
 *   - blocages     : comptes bannis et actions d'administration récentes
 *
 * Chaque volet est calculé dans un try/catch séparé : si une table
 * n'existe pas encore (payment_logs, admin_logs), le reste du tableau
 * de bord continue de fonctionner au lieu de tomber en erreur.
 */

const PRIX_PAR_OFFRE: Record<string, number> = {
  PREMIUM_3M: 16,
  PREMIUM_12M: 25,
  PREMIUM_24M: 70,
  CREATOR_3M: 16,
  CREATOR_12M: 25,
  VIP_24M: 70,
};

const DUREE_MOIS: Record<string, number> = {
  PREMIUM_3M: 3,
  PREMIUM_12M: 12,
  PREMIUM_24M: 24,
  CREATOR_3M: 3,
  CREATOR_12M: 12,
  VIP_24M: 24,
};

async function estAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('email, role, subscriptionTier')
    .eq('id', userId)
    .single();
  return isAdminUser(user);
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let userId: string;
    try {
      userId = JSON.parse(Buffer.from(token, 'base64').toString()).id;
    } catch {
      return NextResponse.json({ error: 'Jeton invalide' }, { status: 401 });
    }

    if (!(await estAdmin(userId))) {
      return NextResponse.json({ error: "Sans autorisation d'administrateur" }, { status: 403 });
    }

    const maintenant = new Date();
    const il30Jours = new Date(maintenant.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dans7Jours = new Date(maintenant.getTime() + 7 * 24 * 60 * 60 * 1000);

    // ---------- ABONNEMENTS ----------
    const abonnements = {
      repartition: {} as Record<string, number>,
      actifs: 0,
      gratuits: 0,
      revenuMensuelRecurrent: 0,
      expirentBientot: [] as Array<{ id: string; email: string; subscriptionTier: string; subscriptionEnd: string }>,
    };

    const { data: tousUtilisateurs } = await supabase
      .from('users')
      .select('id, email, subscriptionTier, subscriptionEnd');

    (tousUtilisateurs ?? []).forEach((u: any) => {
      const offre = u.subscriptionTier ?? 'FREE';
      abonnements.repartition[offre] = (abonnements.repartition[offre] || 0) + 1;

      const expire = u.subscriptionEnd ? new Date(u.subscriptionEnd) : null;
      const encoreValide = !expire || expire > maintenant;

      if (offre === 'FREE') {
        abonnements.gratuits += 1;
      } else if (encoreValide) {
        abonnements.actifs += 1;
        // Revenu mensuel équivalent : prix total réparti sur la durée
        const prix = PRIX_PAR_OFFRE[offre] ?? 0;
        const mois = DUREE_MOIS[offre] ?? 1;
        abonnements.revenuMensuelRecurrent += prix / mois;

        if (expire && expire <= dans7Jours) {
          abonnements.expirentBientot.push({
            id: u.id,
            email: u.email,
            subscriptionTier: offre,
            subscriptionEnd: u.subscriptionEnd,
          });
        }
      }
    });

    abonnements.revenuMensuelRecurrent =
      Math.round(abonnements.revenuMensuelRecurrent * 100) / 100;
    abonnements.expirentBientot.sort(
      (a, b) => new Date(a.subscriptionEnd).getTime() - new Date(b.subscriptionEnd).getTime()
    );
    abonnements.expirentBientot = abonnements.expirentBientot.slice(0, 20);

    // ---------- VISITES ----------
    const visites = {
      inscriptions30Jours: 0,
      connexions30Jours: 0,
      actifs24h: 0,
      actifs7Jours: 0,
      parJour: [] as Array<{ date: string; inscriptions: number; connexions: number }>,
      dernieresInscriptions: [] as Array<{
        id: string;
        email: string;
        username: string;
        subscriptionTier: string;
        createdAt: string;
        lastLoginAt: string | null;
      }>,
    };

    try {
      const { data: activite } = await supabase
        .from('users')
        .select('createdAt, lastLoginAt')
        .gte('createdAt', il30Jours.toISOString());

      const il24h = new Date(maintenant.getTime() - 24 * 60 * 60 * 1000);
      const il7Jours = new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Compteurs par jour, initialisés à zéro pour les 30 jours
      const parJour = new Map<string, { inscriptions: number; connexions: number }>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(maintenant.getTime() - i * 24 * 60 * 60 * 1000);
        parJour.set(d.toISOString().slice(0, 10), { inscriptions: 0, connexions: 0 });
      }

      (activite ?? []).forEach((u: any) => {
        if (u.createdAt) {
          const jour = u.createdAt.slice(0, 10);
          const entree = parJour.get(jour);
          if (entree) {
            entree.inscriptions += 1;
            visites.inscriptions30Jours += 1;
          }
        }
      });

      // Connexions : comptées sur l'ensemble des utilisateurs, pas seulement les récents
      const { data: connexions } = await supabase
        .from('users')
        .select('lastLoginAt')
        .not('lastLoginAt', 'is', null)
        .gte('lastLoginAt', il30Jours.toISOString());

      (connexions ?? []).forEach((u: any) => {
        const date = new Date(u.lastLoginAt);
        visites.connexions30Jours += 1;
        if (date >= il24h) visites.actifs24h += 1;
        if (date >= il7Jours) visites.actifs7Jours += 1;

        const entree = parJour.get(u.lastLoginAt.slice(0, 10));
        if (entree) entree.connexions += 1;
      });

      visites.parJour = Array.from(parJour.entries()).map(([date, v]) => ({
        date,
        inscriptions: v.inscriptions,
        connexions: v.connexions,
      }));

      // Qui s'est inscrit récemment — 30 derniers comptes créés
      const { data: recents } = await supabase
        .from('users')
        .select('id, email, username, subscriptionTier, createdAt, lastLoginAt')
        .order('createdAt', { ascending: false })
        .limit(30);

      visites.dernieresInscriptions = (recents ?? []) as any;
    } catch (e) {
      console.error('[owner-dashboard] volet visites indisponible:', e);
    }

    // ---------- PAIEMENTS ----------
    const paiements = {
      disponible: true,
      total: 0,
      reussis: 0,
      echoues: 0,
      chiffreAffairesTotal: 0,
      chiffreAffaires30Jours: 0,
      derniers: [] as Array<{
        id: string;
        montant: number;
        devise: string;
        statut: string;
        date: string;
        email: string | null;
      }>,
    };

    try {
      const { data: transactions, error } = await supabase
        .from('payment_logs')
        .select('stripe_charge_id, stripe_customer_id, amount, currency, status, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      (transactions ?? []).forEach((t: any) => {
        paiements.total += 1;
        // Stripe stocke les montants en centimes
        const montant = (t.amount ?? 0) / 100;
        if (t.status === 'succeeded') {
          paiements.reussis += 1;
          paiements.chiffreAffairesTotal += montant;
          if (new Date(t.created_at) >= il30Jours) {
            paiements.chiffreAffaires30Jours += montant;
          }
        } else {
          paiements.echoues += 1;
        }
      });

      paiements.chiffreAffairesTotal = Math.round(paiements.chiffreAffairesTotal * 100) / 100;
      paiements.chiffreAffaires30Jours = Math.round(paiements.chiffreAffaires30Jours * 100) / 100;

      // Associe chaque transaction à l'utilisateur qui a payé,
      // via l'identifiant client Stripe stocké sur le compte.
      const idsClients = Array.from(
        new Set(
          (transactions ?? [])
            .map((t: any) => t.stripe_customer_id)
            .filter((v: unknown): v is string => typeof v === 'string' && v.length > 0)
        )
      );

      const emailParClient = new Map<string, string>();
      if (idsClients.length > 0) {
        const { data: payeurs } = await supabase
          .from('users')
          .select('email, stripeCustomerId')
          .in('stripeCustomerId', idsClients);

        (payeurs ?? []).forEach((u: any) => {
          if (u.stripeCustomerId) emailParClient.set(u.stripeCustomerId, u.email);
        });
      }

      paiements.derniers = (transactions ?? []).slice(0, 20).map((t: any) => ({
        id: t.stripe_charge_id,
        montant: (t.amount ?? 0) / 100,
        devise: (t.currency ?? 'eur').toUpperCase(),
        statut: t.status,
        date: t.created_at,
        email: emailParClient.get(t.stripe_customer_id) ?? null,
      }));
    } catch (e) {
      // La table payment_logs n'existe peut-être pas encore
      paiements.disponible = false;
      console.error('[owner-dashboard] volet paiements indisponible:', e);
    }

    // ---------- BLOCAGES ----------
    const blocages = {
      totalBannis: 0,
      bannis: [] as Array<{ id: string; email: string; username: string }>,
      actionsRecentes: [] as Array<{
        action: string;
        adminId: string;
        targetId: string;
        reason: string;
        timestamp: string;
      }>,
      journalDisponible: true,
    };

    try {
      const { data: comptesBannis, count } = await supabase
        .from('users')
        .select('id, email, username', { count: 'exact' })
        .eq('isBanned', true)
        .limit(50);

      blocages.totalBannis = count ?? (comptesBannis ?? []).length;
      blocages.bannis = (comptesBannis ?? []).map((u: any) => ({
        id: u.id,
        email: u.email,
        username: u.username,
      }));
    } catch (e) {
      console.error('[owner-dashboard] liste des bannis indisponible:', e);
    }

    try {
      const { data: journal, error } = await supabase
        .from('admin_logs')
        .select('action, adminId, targetId, reason, timestamp')
        .order('timestamp', { ascending: false })
        .limit(30);

      if (error) throw error;
      blocages.actionsRecentes = (journal ?? []) as any;
    } catch (e) {
      blocages.journalDisponible = false;
      console.error('[owner-dashboard] journal admin indisponible:', e);
    }

    return NextResponse.json({
      genereLe: maintenant.toISOString(),
      abonnements,
      visites,
      paiements,
      blocages,
    });
  } catch (error) {
    console.error('[owner-dashboard]', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du tableau de bord' },
      { status: 500 }
    );
  }
}
