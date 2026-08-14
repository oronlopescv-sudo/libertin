import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  return NextResponse.json({
    groupId,
    messages: [],
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params;
    const body = await req.json();
    const { userAbonnementTier, content, userRole } = body;

    // Premium Gating Check (Bug #1 Fix): Free accounts cannot send messages
    if (userAbonnementTier === 'FREE' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Abonnement requis. Seuls les membres Premium peuvent participer aux tchats de groupe.' },
        { status: 403 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Le contenu du message est vide.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: `msg-${Date.now()}`,
        groupId,
        content,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 });
  }
}
