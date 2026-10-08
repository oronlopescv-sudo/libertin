import { NextRequest, NextResponse } from 'next/server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { createEvent, getEvents } from '@/lib/events';
import type { EventPlanType } from '@/lib/types';

/**
 * GET /api/events — listar anúncios ativos (com filtros ?type= e ?city=).
 *
 * Antes a listagem era feita no browser com a chave anónima: qualquer pessoa
 * lia eventos com localização. Aqui o pedido passa a obrigatório autenticado.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const { searchParams } = new URL(request.url);
    // exactOptionalPropertyTypes: nunca passar chaves undefined.
    const filtro: { type?: string; city?: string; limit?: number } = {};
    const type = searchParams.get('type') ?? '';
    const city = searchParams.get('city') ?? '';
    const limite = Number(searchParams.get('limit')) || 0;
    if (type) filtro.type = type;
    if (city) filtro.city = city;
    if (limite > 0) filtro.limit = limite;

    const events = await getEvents(filtro);
    return NextResponse.json({ events });
  } catch (err) {
    console.error('[events GET]', err);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des événements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events — criar anúncio.
 *
 * O creator_id vem da SESSÃO, nunca do corpo: antes ia do browser e podia
 * ser falsificado (anúncio em nome de outro membro).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const body = await request.json().catch(() => ({}));
    const planoType = body?.plan_type as EventPlanType | undefined;
    if (!planoType) {
      return NextResponse.json({ error: 'Plano do anúncio em falta' }, { status: 400 });
    }

    // createEvent valida título/descrição e devolve { success, eventId?, error? }.
    const result = await createEvent(auth.user.id, {
      type: typeof body.type === 'string' ? body.type : 'festa',
      title: typeof body.title === 'string' ? body.title : '',
      description: typeof body.description === 'string' ? body.description : '',
      location: typeof body.location === 'string' ? body.location : undefined,
      city: typeof body.city === 'string' ? body.city : undefined,
      date_time: typeof body.date_time === 'string' ? body.date_time : undefined,
      is_date_flexible: Boolean(body.is_date_flexible),
      looking_for: typeof body.looking_for === 'string' ? body.looking_for : undefined,
      min_participants: Number.isInteger(body.min_participants) ? body.min_participants : undefined,
      max_participants: Number.isInteger(body.max_participants) ? body.max_participants : undefined,
      plan_type: planoType,
    });

    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (err) {
    console.error('[events POST]', err);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'annonce' },
      { status: 500 }
    );
  }
}