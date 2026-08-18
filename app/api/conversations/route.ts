import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurActuel, utilisateurPremium } from '@/lib/auth-serveur';

/**
 * GET /api/conversations — boîte de réception du membre connecté.
 *
 * Liste ses conversations privées (groupes category='private_dm') avec, pour
 * chacune : l'autre membre (username, avatar de couverture, badge vérifié),
 * le dernier message et sa date. La lecture est ouverte à tout membre
 * connecté ; seul l'envoi est réservé aux Premium.
 */
export async function GET() {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();
    const monId = auth.user.id;

    // 1. Mes conversations privées.
    const { data: mesGroupes } = await supabase
      .from('group_memberships')
      .select('group_id, groups!inner(id)')
      .eq('user_id', monId)
      .eq('groups.category', 'private_dm');

    const idsGroupes = (mesGroupes ?? []).map((g: any) => g.group_id);
    if (idsGroupes.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // 2. L'autre membre de chaque groupe.
    const { data: autresMembres } = await supabase
      .from('group_memberships')
      .select('group_id, user_id')
      .in('group_id', idsGroupes)
      .neq('user_id', monId);

    // 3. Profils + photos de couverture des autres membres.
    const autresUserIds = (autresMembres ?? []).map((m: any) => m.user_id);

    const profilsMap = new Map<string, any>();
    const photoMap = new Map<string, string>();

    if (autresUserIds.length > 0) {
      const [{ data: profils }, { data: photosCouverture }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, is_verified, is_active')
          .in('id', autresUserIds),
        supabase
          .from('photos')
          .select('user_id, url')
          .in('user_id', autresUserIds)
          .eq('is_cover', true),
      ]);
      (profils ?? []).forEach((p: any) => profilsMap.set(p.id, p));
      (photosCouverture ?? []).forEach((p: any) => photoMap.set(p.user_id, p.url));
    }

    // 4. Dernier message de chaque groupe (récupère les récents puis
    //    dédoublonne par group_id en gardant le plus récent).
    const { data: messagesRecents } = await supabase
      .from('messages')
      .select('group_id, content, created_at, user_id')
      .in('group_id', idsGroupes)
      .order('created_at', { ascending: false })
      .limit(500);

    const dernierParGroupe = new Map<string, any>();
    for (const m of messagesRecents ?? []) {
      if (!dernierParGroupe.has(m.group_id)) dernierParGroupe.set(m.group_id, m);
    }

    // 5. Assemble la liste.
    const conversations = (autresMembres ?? []).map((m: any) => {
      const profil = profilsMap.get(m.user_id);
      const dernier = dernierParGroupe.get(m.group_id);
      return {
        groupId: m.group_id,
        userId: m.user_id,
        username: profil?.username ?? 'Membre',
        avatar: photoMap.get(m.user_id) ?? null,
        isVerified: !!profil?.is_verified,
        isActive: profil?.is_active !== false,
        lastMessage: dernier?.content ?? null,
        lastMessageAt: dernier?.created_at ?? null,
        lastMessageFromMe: dernier?.user_id === monId,
      };
    });

    // Tri : conversations avec un message d'abord (date décroissante), puis
    // les conversations vides.
    conversations.sort((a, b) => {
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('[conversations GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

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
