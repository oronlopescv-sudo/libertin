import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createServiceRoleClient } from '@/lib/supabase';
import { utilisateurActuel, utilisateurPremium } from '@/lib/auth-serveur';

/**
 * Rejoindre / manifester son intérêt pour un événement.
 *
 * Réservé aux membres Premium. L'identité vient de la session Supabase Auth,
 * jamais du corps de la requête. L'événement doit être actif et non expiré.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('participer aux événements');
    if (!auth.ok) return auth.reponse;

    const { eventId } = await req.json();
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ error: 'Identifiant d’événement manquant' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // L'événement existe-t-il et est-il encore actif ?
    const { data: evenement, error: erreurEvenement } = await supabase
      .from('events')
      .select('id, is_active, expires_at')
      .eq('id', eventId)
      .single();

    if (erreurEvenement || !evenement) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    if (!evenement.is_active) {
      return NextResponse.json({ error: 'Cet événement n’est plus actif' }, { status: 410 });
    }

    if (evenement.expires_at && new Date(evenement.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Cet événement a expiré' }, { status: 410 });
    }

    // Déjà inscrit ?
    const { data: dejaInscrit } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (dejaInscrit) {
      return NextResponse.json(
        { success: true, eventId, dejaInscrit: true },
        { status: 200 }
      );
    }

    const { error: erreurInsertion } = await supabase.from('event_participants').insert({
      event_id: eventId,
      user_id: auth.user.id,
      status: 'interested',
    });

    if (erreurInsertion) {
      console.error('[events join]', erreurInsertion);
      return NextResponse.json(
        { error: 'Erreur lors de l’inscription à l’événement' },
        { status: 500 }
      );
    }

    await recalculerCompteur(supabase, eventId);

    return NextResponse.json(
      { success: true, eventId, status: 'interested' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[events join]', err);
    return NextResponse.json(
      { error: 'Erreur lors de l’inscription à l’événement' },
      { status: 500 }
    );
  }
}

/**
 * GET — liste des identifiants d'événements pour lesquels le membre connecté
 * s'est déjà manifesté. Utilisée par la page événements pour afficher l'état
 * « Intéressé ✓ » sur les cartes.
 */
export async function GET() {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('event_participants')
      .select('event_id')
      .eq('user_id', auth.user.id);

    if (error) {
      console.error('[events join GET]', error);
      return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }

    return NextResponse.json({ eventIds: (data ?? []).map((p: any) => p.event_id) });
  } catch (err) {
    console.error('[events join GET]', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * DELETE — se retire d'un événement (annule sa manifestation d'intérêt).
 * L'identité vient de la session ; on ne supprime que SA propre participation.
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('participer aux événements');
    if (!auth.ok) return auth.reponse;

    const { eventId } = await req.json().catch(() => ({}));
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ error: 'Identifiant d’événement manquant' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', auth.user.id);

    if (error) {
      console.error('[events leave]', error);
      return NextResponse.json(
        { error: "Erreur lors du retrait de l'événement" },
        { status: 500 }
      );
    }

    await recalculerCompteur(supabase, eventId);

    return NextResponse.json({ success: true, eventId });
  } catch (err) {
    console.error('[events leave]', err);
    return NextResponse.json(
      { error: "Erreur lors du retrait de l'événement" },
      { status: 500 }
    );
  }
}

/**
 * Recalcule le compteur « confirmés » affiché sur la carte : les insertions/
 * suppressions de l'API ne passent pas par la fonction RPC d'origine, on
 * remet donc le compteur à jour depuis le nombre réel de participants.
 *
 * O UPDATE de `events` passou a ser só do criador com o RLS endurecido
 * (migration 010) — um participante comum não pode atualizar a contagem do
 * evento — por isso este recálculo usa a chave de serviço. Se a chave faltar
 * no servidor, o join continua (apenas o contador pode ficar atrasado).
 */
async function recalculerCompteur(_supabase: any, eventId: string) {
  try {
    const servico = createServiceRoleClient();
    const { count } = await servico
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId);

    const { error } = await servico
      .from('events')
      .update({ confirmed_count: count ?? 0 })
      .eq('id', eventId);
    if (error) console.warn('[events/join] recálculo do contador:', error.message);
  } catch (e) {
    console.warn(
      '[events/join] recálculo do contador indisponível:',
      e instanceof Error ? e.message : e
    );
  }
}
