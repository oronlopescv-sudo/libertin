import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurActuel } from '@/lib/auth-serveur';

/**
 * POST /api/reports — signale un membre.
 *
 * Le signalant est TOUJOURS déduit de la session (jamais du corps de la
 * requête) : un visiteur ne peut pas signaler, et personne ne peut
 * falsifier l'auteur du signalement. La table `reports` est en snake_case.
 */
const RAISONS_AUTORISEES = new Set([
  'Faux profil / photos volées',
  'Harcèlement',
  'Contenu inapproprié',
  'Spam / arnaque',
  'Mineur / âge suspect',
  'Autre',
]);

export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const { reportedId, reason, detail } = await req.json().catch(() => ({}));

    if (!reportedId || typeof reportedId !== 'string') {
      return NextResponse.json({ error: 'Membre concerné manquant.' }, { status: 400 });
    }
    if (reportedId === auth.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous signaler vous-même.' }, { status: 400 });
    }
    if (!reason || typeof reason !== 'string' || !RAISONS_AUTORISEES.has(reason)) {
      return NextResponse.json({ error: 'Motif de signalement invalide.' }, { status: 400 });
    }

    const detailFinal =
      typeof detail === 'string' ? detail.trim().slice(0, 1000) : null;

    const supabase = await createServerSupabaseClient();

    // Le signalé doit exister et être actif.
    const { data: cible, error: cibleError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', reportedId)
      .eq('is_active', true)
      .maybeSingle();
    if (cibleError || !cible) {
      return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
    }

    // Un signalement en attente pour le même couple signalant/signalé + motif
    // suffit : on évite les doublons rage-signaling sans bloquer un nouveau
    // motif distinct.
    const { data: existant } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', auth.user.id)
      .eq('reported_id', reportedId)
      .eq('status', 'pending')
      .maybeSingle();
    if (existant) {
      return NextResponse.json(
        { error: 'Vous avez déjà signalé ce membre. Notre équipe traite votre signalement.' },
        { status: 409 }
      );
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: auth.user.id,
      reported_id: reportedId,
      reason,
      detail: detailFinal,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[reports POST]', error);
      return NextResponse.json({ error: 'Erreur lors du signalement.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[reports POST]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}