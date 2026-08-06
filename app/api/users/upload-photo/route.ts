import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (Max 5MB)' }, { status: 400 });
    }

    // In preview environment, return a clean mockup image URL
    const mockUrl = type === 'verification'
      ? 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';

    return NextResponse.json({
      success: true,
      url: mockUrl,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Échec de l\'envoi de la photo' }, { status: 500 });
  }
}
