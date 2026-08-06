import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, description } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Nom et catégorie requis' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      group: {
        id: `group-${Date.now()}`,
        name,
        category,
        description,
        memberCount: 1,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur de création de groupe' }, { status: 500 });
  }
}
