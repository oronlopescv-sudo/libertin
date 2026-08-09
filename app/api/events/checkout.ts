import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

/**
 * POST /api/events/checkout
 * Create checkout session for event listing
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, email, planType, eventTitle } = await request.json();

    if (!userId || !email || !planType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Map event plan to Stripe product
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

    // Create checkout session
    const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/cancel`,
        customer_email: email,
        client_reference_id: userId,
        'metadata[userId]': userId,
        'metadata[planType]': planType,
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
