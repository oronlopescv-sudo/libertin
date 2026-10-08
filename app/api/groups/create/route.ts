import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurPremium } from '@/lib/auth-serveur';
import { temNivelNoMinimo } from '@/lib/premium';

/**
 * Créer un groupe.
 *
 * Réservé aux membres Premium. Le créateur est déduit de la session,
 * jamais du corps de la requête.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('créer des groupes');
    if (!auth.ok) return auth.reponse;

    // «Création illimitée de groupes» é anunciada a partir do Pass Privilège:
    // um Épicurien que chame a rota diretamente NÃO deve conseguir (a UI
    // também bloqueia, mas a rota é a verdade — a UI não pode ser a barreira).
    const nivelOk = temNivelNoMinimo(
      {
        email: auth.user.email,
        role: auth.user.role,
        subscriptionTier: auth.user.subscriptionTier,
        subscriptionEnd: auth.user.subscriptionEnd,
      },
      'PASS_PRIVILEGE'
    );
    if (!nivelOk) {
      return NextResponse.json(
        { error: 'La création de groupes nécessite le Pass Privilège (ou Pass VIP)', premiumRequired: true },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const description =
      typeof body.description === 'string' ? body.description.trim().slice(0, 1000) : null;
    const isPrivate = Boolean(body.isPrivate);
    const maxMembers =
      Number.isInteger(body.maxMembers) && body.maxMembers > 1 && body.maxMembers <= 500
        ? body.maxMembers
        : 50;

    if (!name || !category) {
      return NextResponse.json({ error: 'Nom et catégorie requis' }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Le nom du groupe dépasse 100 caractères' },
        { status: 400 }
      );
    }

    const maintenant = new Date().toISOString();

    const { data: groupe, error } = await supabase
      .from('groups')
      .insert({
        name,
        category,
        description,
        is_private: isPrivate,
        max_members: maxMembers,
        creator_id: auth.user.id,
        creator_name: auth.user.username ?? undefined,
        member_count: 1,
        created_at: maintenant,
        updated_at: maintenant,
      })
      .select('id, name, category, description, is_private, max_members, created_at')
      .single();

    if (error || !groupe) {
      console.error('[groups create]', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du groupe' },
        { status: 500 }
      );
    }

    // Le créateur devient automatiquement administrateur du groupe
    const { error: erreurMembre } = await supabase.from('group_memberships').insert({
      user_id: auth.user.id,
      group_id: groupe.id,
      role: 'admin',
      joined_at: maintenant,
    });

    if (erreurMembre) {
      console.error('[groups create] adhésion du créateur échouée', erreurMembre);
    }

    return NextResponse.json({ success: true, group: groupe }, { status: 201 });
  } catch (err) {
    console.error('[groups create]', err);
    return NextResponse.json(
      { error: 'Erreur lors de la création du groupe' },
      { status: 500 }
    );
  }
}
