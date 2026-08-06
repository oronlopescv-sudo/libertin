import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Webhook de paiement non configuré.',
      message: "Stripe n'est pas encore activé sur ce projet.",
    },
    { status: 501 }
  );
}
