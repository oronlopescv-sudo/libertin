import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { utilisateurPremium } from '@/lib/auth-serveur';

/**
 * Rejoindre un groupe.
 *
 * Réservé aux membres Premium. L'identité et l'abonnement viennent de la
 * session, jamais du corps de la requête.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;

    const auth = await utilisateurPremium('rejoindre des groupes');
    if (!auth.ok) return auth.reponse;

    // Le groupe existe-t-il ?
    const { data: groupe, error: erreurGroupe } = await supabase
      .from('groups')
      .select('id, name, max_members, is_private')
      .eq('id', groupId)
      .single();

    if (erreurGroupe || !groupe) {
      return NextResponse.json({ error: 'Groupe introuvable' }, { status: 404 });
    }

    // Déjà membre ?
    const { data: dejaMembre } = await supabase
      .from('group_memberships')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('group_id', groupId)
      .maybeSingle();

    if (dejaMembre) {
      return NextResponse.json(
        { success: true, groupId, dejaMembre: true },
        { status: 200 }
      );
    }

    // Le groupe est-il complet ?
    const { count } = await supabase
      .from('group_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId);

    const membres = count ?? 0;
    const limite = groupe.max_members ?? 50;

    if (membres >= limite) {
      return NextResponse.json({ error: 'Ce groupe est complet' }, { status: 409 });
    }

    const { error: erreurInsertion } = await supabase.from('group_memberships').insert({
      user_id: auth.user.id,
      group_id: groupId,
      role: 'member',
      joined_at: new Date().toISOString(),
    });

    if (erreurInsertion) {
      console.error('[groups join]', erreurInsertion);
      return NextResponse.json(
        { error: "Erreur lors de l'inscription au groupe" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, groupId, joinedAt: new Date().toISOString() },
      { status: 201 }
    );
  } catch (err) {
    console.error('[groups join]', err);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription au groupe" },
      { status: 500 }
    );
  }
}
