import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { utilisateurActuel } from '@/lib/auth-serveur';

/**
 * GET /api/groups/[id] — détails d'un groupe (nom, nombre de membres).
 *
 * Utilisé par la page de chat pour afficher le titre de la conversation.
 * Pour une conversation privée (category='private_dm'), affiche le nom de
 * l'autre membre plutôt que le nom générique du groupe.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = createServiceRoleClient();

    const { data: groupe, error } = await supabase
      .from('groups')
      .select('id, name, category, member_count')
      .eq('id', id)
      .single();

    if (error || !groupe) {
      return NextResponse.json({ error: 'Groupe introuvable' }, { status: 404 });
    }

    let nom = groupe.name;

    // Conversation privée : afficher le nom de l'autre personne, pas celui
    // stocké sur le groupe (qui peut être obsolète si elle change de pseudo).
    if (groupe.category === 'private_dm') {
      const { data: autreMembre } = await supabase
        .from('group_memberships')
        .select('user_id, profiles:user_id (username)')
        .eq('group_id', id)
        .neq('user_id', auth.user.id)
        .maybeSingle();

      const autreProfil: any = autreMembre?.profiles;
      if (autreProfil?.username) nom = autreProfil.username;
    }

    return NextResponse.json({
      id: groupe.id,
      name: nom,
      memberCount: groupe.member_count,
      isPrivateConversation: groupe.category === 'private_dm',
    });
  } catch (error) {
    console.error('[groups/:id GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
