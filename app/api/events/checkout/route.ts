import { NextRequest, NextResponse } from 'next/server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { EVENT_PLANS } from '@/lib/events';
import type { EventPlanType } from '@/lib/types';

/**
 * POST /api/events/checkout
 * Crée une session de paiement Stripe pour la mise en avant d'un événement.
 *
 * Identité et email proviennent de la session authentifiée — jamais du corps
 * de la requête (sinon n'importe qui pouvait faire payer un autre compte).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const { planType, eventTitle, eventId } = await request.json();
    // O eventId é indispensável: é o identificador que o webhook usa para
    // marcar o anúncio como pago e ativo. Sem ele o dinheiro entra e o
    // evento nunca aparece (is_active ficava false para sempre).
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'eventId do anúncio é obrigatório' },
        { status: 400 }
      );
    }
    if (!planType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // O evento tem de existir E ser do próprio: sem isto, um Premium que
    // conheça o eventId podia pagar a promoção de um anúncio alheio.
    const supabase = await createServerSupabaseClient();
    const { data: evento, error: erroEvento } = await supabase
      .from('events')
      .select('id, creator_id')
      .eq('id', eventId)
      .single();
    if (erroEvento || !evento) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }
    if (evento.creator_id !== auth.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez payer que la mise en avant de vos propres événements" },
        { status: 403 }
      );
    }

    // Cobrança por price_data: o valor cobrado é SEMPRE o EVENT_PLANS.price
    // daqui — nada de env STRIPE_PRODUCT_EVENT_* nem de price IDs que possam
    // divergir do preço mostrado no formulário (€ = euros, x100 = cêntimos).
    const plan = EVENT_PLANS[planType as EventPlanType];
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano de anúncio desconhecido' },
        { status: 400 }
      );
    }

    const userId = auth.user.id;
    const email = auth.user.email ?? undefined;

    const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': `Annonce xlibertine — ${plan.name}`,
        'line_items[0][price_data][unit_amount]': String(Math.round(plan.price * 100)),
        'line_items[0][quantity]': '1',
        mode: 'payment',
        // As respetivas páginas vivem em /evenements (não /events — essa
        // rota não existe no app e 500/404 depois do pagamento).
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/evenements?annonces=succes&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/evenements?annonces=annule`,
        customer_email: email ?? '',
        client_reference_id: userId,
        'metadata[userId]': userId,
        'metadata[planType]': planType,
        'metadata[eventId]': eventId,
        'metadata[eventTitle]': eventTitle || 'Event Listing',
      }).toString(),
    });

    if (!session.ok) {
      throw new Error(`Stripe API error: ${session.statusText}`);
    }

    const checkoutSession = await session.json();

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Event checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}