import { NextRequest, NextResponse } from 'next/server';
import { utilisateurActuel } from '@/lib/auth-serveur';

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

    const eventPrices: Record<string, string> = {
      basic: process.env.STRIPE_PRODUCT_EVENT_BASIC || 'price_event_basic',
      featured: process.env.STRIPE_PRODUCT_EVENT_FEATURED || 'price_event_featured',
      vip_gold: process.env.STRIPE_PRODUCT_EVENT_VIP || 'price_event_vip',
    };

    const priceId = eventPrices[planType];
    if (!priceId || priceId.includes('price_event')) {
      return NextResponse.json(
        { error: 'Event plan not configured' },
        { status: 500 }
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
        'line_items[0][price]': priceId,
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