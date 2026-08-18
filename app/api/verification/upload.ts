import { NextRequest, NextResponse } from 'next/server';
import {
  uploadVerificationPhoto,
  saveVerificationPhoto,
} from '@/lib/photo-verification';
import { validateFileUpload } from '@/lib/validation';
import { utilisateurActuel } from '@/lib/auth-serveur';

/**
 * POST /api/verification/upload
 *
 * Upload d'un selfie de vérification. L'utilisateur est déduit de la session
 * (utilisateurActuel) — JAMAIS du champ formData envoyé par le client.
 * L'ancienne version lisait `formData.get('userId')` sans aucune vérification
 * d'authentification : n'importe quel appelant anonyme pouvait attribuer une
 * photo de vérification à n'importe quel utilisateur. Désormais le userId vient
 * du cookie de session Supabase.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth : l'utilisateur connecté est le propriétaire de la photo. On ignore
    // tout éventuel `userId` envoyé dans le formData (non fiable côté client).
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;
    const userId = auth.user.id;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier manquant' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFileUpload(file, 5, [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload to storage
    const uploadResult = await uploadVerificationPhoto(userId, file);

    if (!uploadResult) {
      return NextResponse.json(
        { error: 'Failed to upload photo' },
        { status: 500 }
      );
    }

    // Save to database and check NSFW
    const saveResult = await saveVerificationPhoto(
      userId,
      uploadResult.url,
      uploadResult.path
    );

    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error, nsfw: saveResult.nsfw },
        { status: saveResult.nsfw ? 400 : 500 }
      );
    }

    return NextResponse.json({
      photoId: saveResult.photoId,
      url: uploadResult.url,
      message: 'Photo soumise pour vérification',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
