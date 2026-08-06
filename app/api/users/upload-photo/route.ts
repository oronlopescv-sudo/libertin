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

    // Storage upload is not configured yet
    return NextResponse.json(
      { error: "Le stockage de fichiers n'est pas encore configuré." },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Échec de l\'envoi de la photo' }, { status: 500 });
  }
}
