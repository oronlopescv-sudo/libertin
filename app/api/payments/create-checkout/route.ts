import { NextRequest, NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, userId, email } = body;

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === tier);
    if (!plan) {
      return NextResponse.json({ error: 'Plan d\'abonnement invalide' }, { status: 400 });
    }

    // In preview mode, return checkout session mock with instant redirection URL
    return NextResponse.json({
      success: true,
      sessionId: `cs_test_${Math.random().toString(36).substring(2, 10)}`,
      checkoutUrl: `/abonnements?status=success&tier=${tier}&user=${userId}`,
      plan,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur création checkout Stripe' }, { status: 500 });
  }
}
