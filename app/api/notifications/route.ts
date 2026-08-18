import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurActuel } from '@/lib/auth-serveur';

/**
 * GET /api/notifications — notifications du membre connecté (30 dernières,
 * plus récentes d'abord) avec le nombre de non-lues.
 *
 * PATCH /api/notifications — marque comme lues. Corps : `{ all: true }` pour
 * tout marquer, ou `{ id: '<uuid>' }` pour une notification précise. Toujours
 * restreint au membre de la session : on ne fait jamais confiance à un
 * `user_id` envoyé par le client.
 */
export async function GET() {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, body, link, is_read, created_at')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('[notifications GET]', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
    }

    const list = data ?? [];
    const unreadCount = list.filter((n: { is_read: boolean }) => !n.is_read).length;

    return NextResponse.json({ notifications: list, unreadCount });
  } catch (error) {
    console.error('[notifications GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const { id, all } = await req.json().catch(() => ({}));

    const supabase = await createServerSupabaseClient();

    if (all) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', auth.user.id)
        .eq('is_read', false);
      if (error) {
        console.error('[notifications PATCH all]', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (typeof id === 'string' && id) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', auth.user.id);
      if (error) {
        console.error('[notifications PATCH id]', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Paramètre manquant (all ou id).' }, { status: 400 });
  } catch (error) {
    console.error('[notifications PATCH]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}