import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Profil utilisateur prêt',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      data: body,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur mise à jour profil' }, { status: 400 });
  }
}
