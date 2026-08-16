import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { utilisateurActuel, utilisateurPremium } from '@/lib/auth-serveur';

/**
 * Messages d'un groupe.
 *
 * Lecture : ouverte à tout membre connecté du groupe.
 * Écriture : réservée aux membres Premium.
 *
 * La table `messages` est en snake_case (group_id, user_id, user_name,
 * user_avatar, content, created_at). L'ancien code utilisait des colonnes
 * camelCase inexistantes (groupId, userId, createdAt, updatedAt) et un join
 * `users(username)` sur une table qui n'existe pas : toute la conversation 404.
 * On lit maintenant les bonnes colonnes et on renvoie du camelCase au client.
 */

/** Vérifie que l'utilisateur appartient bien au groupe. */
async function estMembre(userId: string, groupId: string): Promise<boolean> {
  const { data } = await supabase
    .from('group_memberships')
    .select('id')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .maybeSingle();
  return Boolean(data);
}

function mapMessage(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name ?? row.displayed_username ?? null,
    userAvatar: row.user_avatar ?? null,
    content: row.content,
    createdAt: row.created_at,
  };
}

// GET — lire les messages du groupe
export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;

    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    if (!(await estMembre(auth.user.id, groupId))) {
      return NextResponse.json(
        { error: 'Vous ne faites pas partie de ce groupe' },
        { status: 403 }
      );
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, user_id, user_name, user_avatar, content, created_at, displayed_username')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('[messages GET]', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      groupId,
      messages: (messages ?? []).map(mapMessage),
    });
  } catch (err) {
    console.error('[messages GET]', err);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

// POST — envoyer un message (Premium uniquement)
export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;

    // L'abonnement vient de la base, via la session — pas du corps de la requête
    const auth = await utilisateurPremium('envoyer des messages dans les groupes');
    if (!auth.ok) return auth.reponse;

    if (!(await estMembre(auth.user.id, groupId))) {
      return NextResponse.json(
        { error: 'Vous ne faites pas partie de ce groupe' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json({ error: 'Le contenu du message est vide.' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Le message dépasse 2000 caractères.' },
        { status: 400 }
      );
    }

    const maintenant = new Date().toISOString();

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        group_id: groupId,
        user_id: auth.user.id,
        user_name: auth.user.username,
        content,
        created_at: maintenant,
      })
      .select('id, user_id, user_name, user_avatar, content, created_at, displayed_username')
      .single();

    if (error) {
      console.error('[messages POST]', error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: mapMessage(message) });
  } catch (err) {
    console.error('[messages POST]', err);
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 });
  }
}