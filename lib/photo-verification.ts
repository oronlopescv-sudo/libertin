/**
 * Photo Verification Service
 * Handles photo uploads, NSFW detection, and admin verification workflow
 *
 * Toute opération passe par comRetomada() (voir lib/upload-fallback.ts) :
 * écriture avec la clé de service si elle est exploitable, sinon (ou en cas
 * de rejet d'authentification) avec la session du membre. Avant ce refactor,
 * une clé de service morte/vide (« Invalid Compact JWS », « Unregistered »)
 * faisait échouer silencieusement tous les uploads et la file admin.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { comRetomada, mensagensDeErroUpload } from '@/lib/upload-fallback';
import { clienteDeEscrita } from '@/lib/upload-fallback';

export interface VerificationPhotoResult {
  success: boolean;
  photoId?: string;
  error?: string;
  nsfw?: boolean;
}

export type ResultadoUploadFotografia = { url: string; path: string } | { erro: string };

/** Exécute l'opération et lève si elle échoue (comme l'ancien code en ligne). */
async function viaFallback<T = any>(
  operacao: (cliente: SupabaseClient) => PromiseLike<unknown>
): Promise<T> {
  const { data, error } = await comRetomada<T>(operacao);
  if (error) throw new Error(error.message || 'Erreur de stockage');
  return data as T;
}

/**
 * Upload photo to Supabase Storage (bucket `verification-photos`)
 */
export async function uploadVerificationPhoto(
  userId: string,
  file: File
): Promise<ResultadoUploadFotografia> {
  try {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large (max 5MB)');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Invalid file type');
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `verification/${userId}/${timestamp}-${file.name}`;

    const { data, error } = await comRetomada<{ path: string }>((c) =>
      c.storage.from('verification-photos').upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      })
    );

    if (error || !data) {
      console.error('Failed to upload photo:', error);
      return { erro: mensagensDeErroUpload(error) };
    }

    // Get public URL
    const { cliente } = await clienteDeEscrita();
    const { data: urlData } = cliente.storage.from('verification-photos').getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Failed to upload photo:', error);
    return { erro: mensagensDeErroUpload(error) };
  }
}

/**
 * Check photo for NSFW content using Google Vision API
 * Returns true if content is NSFW
 */
export async function checkNSFWContent(imageUrl: string): Promise<boolean> {
  try {
    // If Google Vision not configured, skip check
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('NSFW detection disabled (no Google credentials)');
      return false;
    }

    // Use Google's Safe Search detection via REST API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [{ type: 'SAFE_SEARCH_DETECTION' }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Google Vision API error:', response.statusText);
      // Default to allowing image if API fails
      return false;
    }

    const result = await response.json();
    const safeSearch = result.responses?.[0]?.safeSearchAnnotation;

    if (!safeSearch) return false;

    // Check safety scores
    // Likelihood: UNKNOWN(0), VERY_UNLIKELY(1), UNLIKELY(2), POSSIBLE(3), LIKELY(4), VERY_LIKELY(5)
    const isNSFW =
      safeSearch.adult === 'LIKELY' ||
      safeSearch.adult === 'VERY_LIKELY' ||
      safeSearch.porn === 'LIKELY' ||
      safeSearch.porn === 'VERY_LIKELY';

    return isNSFW;
  } catch (error) {
    console.error('NSFW check failed:', error);
    // Default to allowing image if check fails
    return false;
  }
}

/**
 * Save verification photo to database and queue for admin review
 */
export async function saveVerificationPhoto(
  userId: string,
  photoUrl: string,
  photoPath: string
): Promise<VerificationPhotoResult> {
  // Check for NSFW content
  const isNSFW = await checkNSFWContent(photoUrl);

  if (isNSFW) {
    // Delete the uploaded photo (uniquement si elle a été stockée : le mode
    // « URL directe » n'a rien dans Storage, photoPath est alors vide).
    if (photoPath) {
      await comRetomada((c) => c.storage.from('verification-photos').remove([photoPath]));
    }
    return {
      success: false,
      error: 'Photo contient du contenu non approprié',
      nsfw: true,
    };
  }

  // Insert into verification_photos table
  const { data, error } = await comRetomada<{ id: string }>((c) =>
    c
      .from('verification_photos')
      .insert({
        user_id: userId,
        url: photoUrl,
        status: 'pending',
      })
      .select()
      .single()
  );

  if (error || !data) {
    console.error('Failed to save verification photo:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'enregistrement de la photo',
    };
  }

  return {
    success: true,
    photoId: data.id,
  };
}

/**
 * Get verification photos for a user (admin only)
 */
export async function getUserVerificationPhotos(
  userId: string
): Promise<any[] | null> {
  const { data, error } = await comRetomada<any[]>((c) =>
    c
      .from('verification_photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  );

  if (error) {
    console.error('Failed to get verification photos:', error);
    return null;
  }
  return data;
}

/**
 * Get pending verification photos (admin queue)
 */
export async function getPendingVerifications(
  limit: number = 50,
  offset: number = 0
): Promise<any[] | null> {
  // La FK verification_photos.user_id → profiles(id) (Supabase Auth), et NON
  // vers l'ancienne table `users`. L'ancienne jointure `users!...` échouait
  // à l'exécution sur le schéma live → la file d'attente admin était vide.
  const { data, error } = await comRetomada<any[]>((c) =>
    c
      .from('verification_photos')
      .select(
        `
        *,
        profiles!verification_photos_user_id_fkey (
          username,
          email,
          date_of_birth,
          gender,
          location
        )
      `
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)
  );

  if (error) {
    console.error('Failed to get pending verifications:', error);
    return null;
  }
  return data;
}

/**
 * Approve a verification photo
 */
export async function approveVerification(
  photoId: string,
  adminId: string
): Promise<boolean> {
  try {
    // Get photo to find user
    const photo = await viaFallback<{ user_id: string }>((c) =>
      c
        .from('verification_photos')
        .select('user_id')
        .eq('id', photoId)
        .single()
    );

    // Update photo status
    await viaFallback((c) =>
      c
        .from('verification_photos')
        .update({
          status: 'approved',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', photoId)
    );

    // Update verification status dans `profiles` (Supabase Auth) — et NON dans
    // l'ancienne table `users`. C'est profiles.is_verified que lit tout le
    // reste de l'app (badge vérifié, /api/profiles/[id], /api/admin/users).
    // Avant, l'admin approuvait → users.is_verified=true, mais le badge
    // (profiles.is_verified) restait false à jamais.
    await viaFallback((c) =>
      c
        .from('profiles')
        .update({
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', photo.user_id)
    );

    // Send approval email
    const userData = await viaFallback<{ email: string; username: string }>((c) =>
      c
        .from('profiles')
        .select('email, username')
        .eq('id', photo.user_id)
        .single()
    );

    if (userData?.email) {
      try {
        const { sendPhotoApprovedEmail } = await import('@/lib/email');
        await sendPhotoApprovedEmail(userData.email, userData.username);
      } catch (err) {
        console.error('Failed to send approval email:', err);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to approve verification:', error);
    return false;
  }
}

/**
 * Reject a verification photo
 */
export async function rejectVerification(
  photoId: string,
  adminId: string,
  reason: string
): Promise<boolean> {
  try {
    // Get photo to find user
    const photo = await viaFallback<{ user_id: string; url: string }>((c) =>
      c
        .from('verification_photos')
        .select('user_id, url')
        .eq('id', photoId)
        .single()
    );

    // Delete from storage
    const pathMatch = photo.url.match(/verification\/[^?]+/);
    if (pathMatch) {
      await comRetomada((c) =>
        c.storage.from('verification-photos').remove([pathMatch[0]])
      );
    }

    // Update photo status
    await viaFallback((c) =>
      c
        .from('verification_photos')
        .update({
          status: 'rejected',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', photoId)
    );

    // Send rejection email — profil lu dans `profiles` (Supabase Auth).
    const userData = await viaFallback<{ email: string; username: string }>((c) =>
      c
        .from('profiles')
        .select('email, username')
        .eq('id', photo.user_id)
        .single()
    );

    if (userData?.email) {
      try {
        const { sendPhotoRejectedEmail } = await import('@/lib/email');
        await sendPhotoRejectedEmail(userData.email, userData.username, reason);
      } catch (err) {
        console.error('Failed to send rejection email:', err);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to reject verification:', error);
    return false;
  }
}

/**
 * Get verification statistics
 */
export async function getVerificationStats(): Promise<{
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
} | null> {
  const { data, error } = await comRetomada<{ status: string }[]>((c) =>
    c.from('verification_photos').select('status')
  );

  if (error) {
    console.error('Failed to get verification stats:', error);
    return null;
  }

  const stats: { pending: number; approved: number; rejected: number } = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  (data ?? []).forEach((item) => {
    if (item?.status in stats) stats[item.status as keyof typeof stats]++;
  });

  const total = stats.pending + stats.approved + stats.rejected;
  const approvalRate = total > 0 ? (stats.approved / total) * 100 : 0;

  return {
    ...stats,
    approvalRate: Math.round(approvalRate),
  };
}