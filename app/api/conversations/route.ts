import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurPremium } from '@/lib/auth-serveur';

/**
 * POST /api/conversations — retrouve ou crée une conversation privée avec
 * un autre membre.
 *
 * Il n'existe pas de table dédiée aux messages privés : une conversation
 * privée est un groupe à deux personnes, marqué category='private_dm'. On
 * cherche d'abord un groupe existant entre les deux comptes avant d'en
 * créer un nouveau, pour ne jamais dupliquer une conversation.
 *
 * Réservé aux membres Premium — c'est l'envoi de messages qui est payant,
 * pas la consultation des profils.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('envoyer des messages privés');
    if (!auth.ok) return auth.reponse;

    const { targetUserId } = await req.json().catch(() => ({}));
    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json({ error: "L'identifiant du destinataire est requis" }, { status: 400 });
    }
    if (targetUserId === auth.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous écrire à vous-même' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Le destinataire existe-t-il ?
    const { data: cible, error: cibleError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', targetUserId)
      .single();
    if (cibleError || !cible) {
      return NextResponse.json({ error: 'Ce membre est introuvable' }, { status: 404 });
    }

    // Cherche une conversation privée déjà existante entre les deux comptes.
    const { data: mesGroupesPrives } = await supabase
      .from('group_memberships')
      .select('group_id, groups!inner(category)')
      .eq('user_id', auth.user.id)
      .eq('groups.category', 'private_dm');

    const idsGroupesPrives = (mesGroupesPrives ?? []).map((g: any) => g.group_id);

    if (idsGroupesPrives.length > 0) {
      const { data: conversationExistante } = await supabase
        .from('group_memberships')
        .select('group_id')
        .eq('user_id', targetUserId)
        .in('group_id', idsGroupesPrives)
        .limit(1)
        .maybeSingle();

      if (conversationExistante) {
        return NextResponse.json({ groupId: conversationExistante.group_id }, { status: 200 });
      }
    }

    // Aucune conversation existante : on en crée une.
    const maintenant = new Date().toISOString();
    const { data: nouveauGroupe, error: groupeError } = await supabase
      .from('groups')
      .insert({
        name: cible.username,
        description: 'Conversation privée',
        category: 'private_dm',
        is_private: true,
        max_members: 2,
        creator_id: auth.user.id,
        creator_name: auth.user.username,
        member_count: 2,
        created_at: maintenant,
        updated_at: maintenant,
      })
      .select('id')
      .single();

    if (groupeError || !nouveauGroupe) {
      console.error('[conversations POST] création du groupe', groupeError);
      return NextResponse.json({ error: 'Erreur lors de la création de la conversation' }, { status: 500 });
    }

    const { error: membresError } = await supabase.from('group_memberships').insert([
      { user_id: auth.user.id, group_id: nouveauGroupe.id, role: 'admin', joined_at: maintenant },
      { user_id: targetUserId, group_id: nouveauGroupe.id, role: 'member', joined_at: maintenant },
    ]);

    if (membresError) {
      console.error('[conversations POST] ajout des membres', membresError);
      return NextResponse.json({ error: 'Erreur lors de la création de la conversation' }, { status: 500 });
    }

    return NextResponse.json({ groupId: nouveauGroupe.id }, { status: 201 });
  } catch (error) {
    console.error('[conversations POST]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
