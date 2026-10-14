import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { isPremium } from '@/lib/premium';

/**
 * Messages d'un groupe.
 *
 * Lecture : ouverte à tout membre connecté du groupe.
 * Écriture : texte ouvert à tous les membres du groupe (limite anti-spam pour
 * les comptes gratuits) ; l'envoi d'images reste réservé aux Premium.
 *
 * La table `messages` est en snake_case (group_id, user_id, user_name,
 * user_avatar, content, created_at). L'ancien code utilisait des colonnes
 * camelCase inexistantes (groupId, userId, createdAt, updatedAt) et un join
 * `users(username)` sur une table qui n'existe pas : toute la conversation 404.
 * On lit maintenant les bonnes colonnes et on renvoie du camelCase au client.
 */

/** Vérifie que l'utilisateur appartient bien au groupe. */
async function estMembre(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  groupId: string
): Promise<boolean> {
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
    userName: row.user_name ?? null,
    userAvatar: row.user_avatar ?? null,
    groupId: row.group_id,
    content: row.content,
    mediaUrl: row.media_url ?? null,
    createdAt: row.created_at,
  };
}

// GET — lire les messages du groupe
export async function GET(_req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;

    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();

    if (!(await estMembre(supabase, auth.user.id, groupId))) {
      return NextResponse.json(
        { error: 'Vous ne faites pas partie de ce groupe' },
        { status: 403 }
      );
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, user_id, group_id, user_name, user_avatar, content, media_url, created_at')
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

// POST — envoyer un message (texte : tous ; image : Premium)
export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;

    // L'abonnement vient de la base, via la session — pas du corps de la requête
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;
    const premium = isPremium(auth.user);

    const supabase = await createServerSupabaseClient();

    if (!(await estMembre(supabase, auth.user.id, groupId))) {
      return NextResponse.json(
        { error: 'Vous ne faites pas partie de ce groupe' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const mediaUrl = typeof body.mediaUrl === 'string' ? body.mediaUrl.trim() : '';

    // Un message doit contenir au moins un texte ou une image.
    if (!content && !mediaUrl) {
      return NextResponse.json({ error: 'Le contenu du message est vide.' }, { status: 400 });
    }

    // Images : réservées aux Premium.
    if (mediaUrl && !premium) {
      return NextResponse.json(
        { error: "L'envoi d'images est réservé aux membres Premium.", premiumRequired: true },
        { status: 403 }
      );
    }

    // Anti-spam pour les comptes gratuits : 30 messages par heure.
    if (!premium) {
      const depuis = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', auth.user.id)
        .gte('created_at', depuis);
      if ((count ?? 0) >= 30) {
        return NextResponse.json(
          { error: 'Limite de 30 messages par heure atteinte pour les comptes gratuits. Réessayez plus tard ou passez Premium.' },
          { status: 429 }
        );
      }
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
        media_url: mediaUrl || null,
        created_at: maintenant,
      })
      .select('id, user_id, group_id, user_name, user_avatar, content, media_url, created_at')
      .single();

    if (error) {
      console.error('[messages POST]', error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message" },
        { status: 500 }
      );
    }

    // Notifier les autres membres du groupe (best-effort : jamais bloquant).
    try {
      const { data: membres } = await supabase
        .from('group_memberships')
        .select('user_id')
        .eq('group_id', groupId)
        .neq('user_id', auth.user.id)
        .limit(50);
      const autres = (membres ?? []).map((m: { user_id: string }) => m.user_id);
      if (autres.length > 0) {
        // S'il n'y a que l'image (pas de texte), un placeholder lisible.
        const textePreview = content || '📷 Photo';
        const preview = textePreview.length > 80 ? textePreview.slice(0, 80) + '…' : textePreview;
        await supabase.from('notifications').insert(
          autres.map((uid: string) => ({
            user_id: uid,
            type: 'message',
            title: 'Nouveau message',
            body: `${auth.user.username} : ${preview}`,
            link: `/chat/${groupId}`,
            is_read: false,
            created_at: maintenant,
          }))
        );
      }
    } catch (notifErr) {
      console.warn('[messages POST notif]', notifErr);
    }

    return NextResponse.json({ success: true, message: mapMessage(message) });
  } catch (err) {
    console.error('[messages POST]', err);
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 });
  }
}