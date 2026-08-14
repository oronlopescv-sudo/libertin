import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { utilisateurActuel, utilisateurPremium } from '@/lib/auth-serveur';

/**
 * Messages d'un groupe.
 *
 * Lecture : ouverte à tout membre connecté du groupe.
 * Écriture : réservée aux membres Premium.
 *
 * L'abonnement est lu depuis la session et vérifié en base — jamais depuis
 * le corps de la requête, que le navigateur contrôle entièrement.
 */

/** Vérifie que l'utilisateur appartient bien au groupe. */
async function estMembre(userId: string, groupId: string): Promise<boolean> {
  const { data } = await supabase
    .from('group_memberships')
    .select('id')
    .eq('userId', userId)
    .eq('groupId', groupId)
    .maybeSingle();
  return Boolean(data);
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
      .select('id, content, createdAt, userId, users(username)')
      .eq('groupId', groupId)
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[messages GET]', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      groupId,
      messages: (messages ?? []).reverse(),
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

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        groupId,
        userId: auth.user.id,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select('id, content, createdAt, userId')
      .single();

    if (error) {
      console.error('[messages POST]', error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error('[messages POST]', err);
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 });
  }
}
