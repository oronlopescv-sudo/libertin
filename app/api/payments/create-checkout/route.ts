import { NextRequest, NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier } = body;

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === tier);
    if (!plan) {
      return NextResponse.json({ error: "Plan d'abonnement invalide" }, { status: 400 });
    }

    // Stripe checkout is not configured yet.
    return NextResponse.json(
      {
        error: 'Passerelle de paiement non configurée.',
        message: 'Stripe n\'est pas encore activé sur ce projet.',
      },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Erreur création checkout' }, { status: 500 });
  }
}
