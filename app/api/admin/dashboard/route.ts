import { NextRequest, NextResponse } from 'next/server';
import { utilisateurAdmin } from '@/lib/auth-serveur';
import { createServiceRoleClient } from '@/lib/supabase';

/**
 * GET /api/admin/dashboard — statistiques globales.
 *
 * Chaque compteur est isolé dans un try/catch : si une table n'existe pas
 * encore (ex. likes), le reste du tableau de bord continue de fonctionner
 * au lieu de tomber en erreur 500. Lit `profiles` (snake_case) via la clé de
 * service, après vérification que l'appelant est administrateur.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await utilisateurAdmin();
    if (!auth.ok) return auth.reponse;

    const supabase = createServiceRoleClient();

    const stats = {
      totalUsers: 0,
      tierBreakdown: {} as Record<string, number>,
      totalGroups: 0,
      totalMessages: 0,
      onlineUsers: 0,
      newUsersThisMonth: 0,
    };

    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      stats.totalUsers = totalUsers || 0;
    } catch (e) {
      console.error('[admin dashboard] totalUsers:', e);
    }

    try {
      const { data: tierStats } = await supabase.from('profiles').select('subscription_tier');
      (tierStats ?? []).forEach((u: any) => {
        const tier = u.subscription_tier ?? 'FREE';
        stats.tierBreakdown[tier] = (stats.tierBreakdown[tier] || 0) + 1;
      });
    } catch (e) {
      console.error('[admin dashboard] tierBreakdown:', e);
    }

    try {
      const { count: totalGroups } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true });
      stats.totalGroups = totalGroups || 0;
    } catch (e) {
      console.error('[admin dashboard] totalGroups:', e);
    }

    try {
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
      stats.totalMessages = totalMessages || 0;
    } catch (e) {
      console.error('[admin dashboard] totalMessages:', e);
    }

    // Utilisateurs « en ligne » : profils mis à jour dans les 5 dernières minutes.
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: onlineUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', fiveMinutesAgo);
      stats.onlineUsers = onlineUsers || 0;
    } catch (e) {
      console.error('[admin dashboard] onlineUsers:', e);
    }

    // Nouveaux comptes sur les 30 derniers jours.
    try {
      const lastMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthAgo);
      stats.newUsersThisMonth = newUsersThisMonth || 0;
    } catch (e) {
      console.error('[admin dashboard] newUsersThisMonth:', e);
    }

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}