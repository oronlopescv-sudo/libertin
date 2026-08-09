import { NextRequest, NextResponse } from 'next/server';
import {
  uploadVerificationPhoto,
  saveVerificationPhoto,
} from '@/lib/photo-verification';
import { validateFileUpload } from '@/lib/validation';

/**
 * POST /api/verification/upload
 * Upload verification photo
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing file or userId' },
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
