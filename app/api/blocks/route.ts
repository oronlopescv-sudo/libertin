import { NextRequest, NextResponse } from 'next/server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Lista de bloqueados — PERSISTENTE (tabela `blocked_users` no servidor).
 *
 * Antes o botão «Bloquer» gravava só em localStorage: não sobrevivia a
 * mudança de dispositivo e não impedia nada. Agora:
 *   – discovery (/api/discovery) já não mostra quem EU bloqueei;
 *   – /api/profiles/[id] devolve 404 se o dono me tiver bloqueado;
 *   – a lista aqui é a fonte, o localStorage deixou de ser usado.
 */
export async function GET() {
  const auth = await utilisateurActuel();
  if (!auth.ok) return auth.reponse;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('user_id', auth.user.id);

  if (error) {
    console.error('[blocks GET]', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des blocages' }, { status: 500 });
  }

  return NextResponse.json({
    blockedIds: (data ?? []).map((r: { blocked_id: string }) => r.blocked_id),
  });
}

export async function POST(request: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const body = await request.json().catch(() => ({}));
    const blockedId = typeof body.blockedId === 'string' ? body.blockedId : '';

    if (!blockedId) {
      return NextResponse.json({ error: 'blockedId requis' }, { status: 400 });
    }
    if (blockedId === auth.user.id) {
      return NextResponse.json({ error: 'Ne pas se bloquer soi-même' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Sem garantia de unique (user_id, blocked_id) na tabela — dedupe à mão
    // para que replays e duplos cliques não criem linhas duplas.
    const { data: jaExiste } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('blocked_id', blockedId)
      .limit(1);

    if (jaExiste && jaExiste.length > 0) {
      return NextResponse.json({ blocked: true });
    }

    const { error } = await supabase.from('blocked_users').insert({
      id: crypto.randomUUID(),
      user_id: auth.user.id,
      blocked_id: blockedId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[blocks POST]', error);
      return NextResponse.json({ error: 'Erreur lors du blocage' }, { status: 500 });
    }

    return NextResponse.json({ blocked: true });
  } catch (err) {
    console.error('[blocks POST]', err);
    return NextResponse.json({ error: 'Erreur lors du blocage' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const body = await request.json().catch(() => ({}));
    const blockedId = typeof body.blockedId === 'string' ? body.blockedId : '';

    if (!blockedId) {
      return NextResponse.json({ error: 'blockedId requis' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('user_id', auth.user.id)
      .eq('blocked_id', blockedId);

    if (error) {
      console.error('[blocks DELETE]', error);
      return NextResponse.json({ error: 'Erreur lors du déblocage' }, { status: 500 });
    }

    return NextResponse.json({ blocked: false });
  } catch (err) {
    console.error('[blocks DELETE]', err);
    return NextResponse.json({ error: 'Erreur lors du déblocage' }, { status: 500 });
  }
}