import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurPremium } from '@/lib/auth-serveur';

/**
 * Rejoindre un groupe.
 *
 * Réservé aux membres Premium. L'identité et l'abonnement viennent de la
 * session, jamais du corps de la requête.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;

    const auth = await utilisateurPremium('rejoindre des groupes');
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();

    // Le groupe existe-t-il ?
    const { data: groupe, error: erreurGroupe } = await supabase
      .from('groups')
      .select('id, name, max_members, is_private, member_count')
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

    // O contador conta-se via chave de SERVIÇO: com RLS fechado, um membro
    // comum não pode fazer UPDATE em groups (só o criador pode editar o
    // grupo); service_role contorna o RLS de propósito.
    const servico = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key',
      { auth: { persistSession: false } }
    );
    await servico
      .from('groups')
      .update({ member_count: (groupe.member_count ?? 0) + 1 })
      .eq('id', groupId);

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
