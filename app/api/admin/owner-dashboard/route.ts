import { NextRequest, NextResponse } from 'next/server';
import { utilisateurAdmin } from '@/lib/auth-serveur';
import { createServiceRoleClient } from '@/lib/supabase';

/**
 * Tableau de bord propriétaire.
 *
 *   - abonnements  : répartition, revenus récurrents, expirations proches
 *   - visites      : inscriptions sur 30 jours (connexions indisponibles : la
 *                    colonne last_login_at n'existe pas dans profiles)
 *   - paiements    : transactions réussies / échouées, chiffre d'affaires
 *   - blocages     : comptes suspendus et actions d'administration récentes
 *
 * Chaque volet est isolé dans un try/catch : si une table n'existe pas encore
 * (payment_logs, admin_logs), le reste continue de fonctionner. Lit `profiles`
 * (snake_case) via la clé de service après vérification administrateur.
 */

// Prix MENSUELS canoniques (cf. lib/stripe.ts SUBSCRIPTION_PLANS : 9/15/25 EUR).
// Abonnement mensuel récurrent : le prix ci-dessous est déjà le montant prélevé
// chaque mois — pas de division par une durée.
const PRIX_PAR_OFFRE: Record<string, number> = {
  PASS_EPICURIEN: 9,
  PASS_PRIVILEGE: 15,
  PASS_VIP: 25,
};

export async function GET(req: NextRequest) {
  try {
    const auth = await utilisateurAdmin();
    if (!auth.ok) return auth.reponse;

    const supabase = createServiceRoleClient();

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

    const { data: tousProfils } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, subscription_end');

    (tousProfils ?? []).forEach((u: any) => {
      const offre = u.subscription_tier ?? 'FREE';
      abonnements.repartition[offre] = (abonnements.repartition[offre] || 0) + 1;

      const expire = u.subscription_end ? new Date(u.subscription_end) : null;
      const encoreValide = !expire || expire > maintenant;

      if (offre === 'FREE') {
        abonnements.gratuits += 1;
      } else if (encoreValide) {
        abonnements.actifs += 1;
        // Abonnement mensuel : le prix de l'offre est déjà le MRR unitaire.
        abonnements.revenuMensuelRecurrent += PRIX_PAR_OFFRE[offre] ?? 0;

        if (expire && expire <= dans7Jours) {
          abonnements.expirentBientot.push({
            id: u.id,
            email: u.email,
            subscriptionTier: offre,
            subscriptionEnd: u.subscription_end,
          });
        }
      }
    });

    abonnements.revenuMensuelRecurrent = Math.round(abonnements.revenuMensuelRecurrent * 100) / 100;
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
        .from('profiles')
        .select('created_at')
        .gte('created_at', il30Jours.toISOString());

      const parJour = new Map<string, { inscriptions: number; connexions: number }>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(maintenant.getTime() - i * 24 * 60 * 60 * 1000);
        parJour.set(d.toISOString().slice(0, 10), { inscriptions: 0, connexions: 0 });
      }

      (activite ?? []).forEach((u: any) => {
        if (u.created_at) {
          const jour = u.created_at.slice(0, 10);
          const entree = parJour.get(jour);
          if (entree) {
            entree.inscriptions += 1;
            visites.inscriptions30Jours += 1;
          }
        }
      });

      // Connexions : last_login_at n'existe pas dans `profiles` -> reste à 0.
      // (Bloc isolé pour ne pas casser les inscriptions si la colonne apparaît plus tard.)
      try {
        const { data: connexions } = await supabase
          .from('profiles')
          .select('last_login_at')
          .not('last_login_at', 'is', null)
          .gte('last_login_at', il30Jours.toISOString());

        const il24h = new Date(maintenant.getTime() - 24 * 60 * 60 * 1000);
        const il7Jours = new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000);

        (connexions ?? []).forEach((u: any) => {
          if (!u.last_login_at) return;
          const date = new Date(u.last_login_at);
          visites.connexions30Jours += 1;
          if (date >= il24h) visites.actifs24h += 1;
          if (date >= il7Jours) visites.actifs7Jours += 1;
          const entree = parJour.get(u.last_login_at.slice(0, 10));
          if (entree) entree.connexions += 1;
        });
      } catch (e) {
        // last_login_at absent : connexions restent à 0
      }

      visites.parJour = Array.from(parJour.entries()).map(([date, v]) => ({
        date,
        inscriptions: v.inscriptions,
        connexions: v.connexions,
      }));

      const { data: recents } = await supabase
        .from('profiles')
        .select('id, email, username, subscription_tier, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      visites.dernieresInscriptions = (recents ?? []).map((u: any) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        subscriptionTier: u.subscription_tier,
        createdAt: u.created_at,
        lastLoginAt: null,
      }));
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
          .from('profiles')
          .select('email, stripe_customer_id')
          .in('stripe_customer_id', idsClients);

        (payeurs ?? []).forEach((u: any) => {
          if (u.stripe_customer_id) emailParClient.set(u.stripe_customer_id, u.email);
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
      const { data: comptesSuspendus, count } = await supabase
        .from('profiles')
        .select('id, email, username', { count: 'exact' })
        .eq('is_active', false)
        .limit(50);

      blocages.totalBannis = count ?? (comptesSuspendus ?? []).length;
      blocages.bannis = (comptesSuspendus ?? []).map((u: any) => ({
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
        .select('action, admin_id, target_id, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      blocages.actionsRecentes = (journal ?? []).map((j: any) => ({
        action: j.action,
        adminId: j.admin_id,
        targetId: j.target_id,
        reason: j.reason,
        timestamp: j.created_at,
      }));
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