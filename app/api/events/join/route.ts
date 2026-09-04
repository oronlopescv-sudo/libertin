import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurPremium } from '@/lib/auth-serveur';

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
