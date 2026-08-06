import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    provider: 'NextAuth.js Custom JWT Handler',
    message: 'RencontresPremium Session Active',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    return NextResponse.json({
      token: `jwt_session_${Date.now()}`,
      user: {
        email,
        username: email.split('@')[0],
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 500 });
  }
}
