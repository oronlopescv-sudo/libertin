/**
 * Photo Verification Service
 * Handles photo uploads, NSFW detection, and admin verification workflow
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface VerificationPhotoResult {
  success: boolean;
  photoId?: string;
  error?: string;
  nsfw?: boolean;
}

/**
 * Upload photo to Supabase Storage
 */
export async function uploadVerificationPhoto(
  userId: string,
  file: File
): Promise<{ url: string; path: string } | null> {
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

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('verification-photos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('verification-photos')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Failed to upload photo:', error);
    return null;
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
      safeSearch.racy === 'LIKELY' ||
      safeSearch.racy === 'VERY_LIKELY';

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
  try {
    // Check for NSFW content
    const isNSFW = await checkNSFWContent(photoUrl);

    if (isNSFW) {
      // Delete the uploaded photo
      await supabase.storage.from('verification-photos').remove([photoPath]);
      return {
        success: false,
        error: 'Photo contient du contenu non approprié',
        nsfw: true,
      };
    }

    // Insert into verification_photos table
    const { data, error } = await supabase
      .from('verification_photos')
      .insert({
        user_id: userId,
        url: photoUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      photoId: data.id,
    };
  } catch (error) {
    console.error('Failed to save verification photo:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'enregistrement de la photo',
    };
  }
}

/**
 * Get verification photos for a user (admin only)
 */
export async function getUserVerificationPhotos(
  userId: string
): Promise<any[] | null> {
  try {
    const { data, error } = await supabase
      .from('verification_photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get verification photos:', error);
    return null;
  }
}

/**
 * Get pending verification photos (admin queue)
 */
export async function getPendingVerifications(
  limit: number = 50,
  offset: number = 0
): Promise<any[] | null> {
  try {
    // La FK verification_photos.user_id → profiles(id) (Supabase Auth), et NON
    // vers l'ancienne table `users`. L'ancienne jointure `users!...` échouait
    // à l'exécution sur le schéma live → la file d'attente admin était vide.
    const { data, error } = await supabase
      .from('verification_photos')
      .select(`
        *,
        profiles!verification_photos_user_id_fkey (
          username,
          email,
          date_of_birth,
          gender,
          location
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get pending verifications:', error);
    return null;
  }
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
    const { data: photo, error: photoError } = await supabase
      .from('verification_photos')
      .select('user_id')
      .eq('id', photoId)
      .single();

    if (photoError) throw photoError;

    // Update photo status
    const { error: updateError } = await supabase
      .from('verification_photos')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', photoId);

    if (updateError) throw updateError;

    // Update verification status dans `profiles` (Supabase Auth) — et NON dans
    // l'ancienne table `users`. C'est profiles.is_verified que lit tout le
    // reste de l'app (badge vérifié, /api/profiles/[id], /api/admin/users).
    // Avant, l'admin approuvait → users.is_verified=true, mais le badge
    // (profiles.is_verified) restait false à jamais.
    const { error: userError } = await supabase
      .from('profiles')
      .update({
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', photo.user_id);

    if (userError) throw userError;

    // Send approval email
    const { data: userData } = await supabase
      .from('profiles')
      .select('email, username')
      .eq('id', photo.user_id)
      .single();

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
    const { data: photo, error: photoError } = await supabase
      .from('verification_photos')
      .select('user_id, url')
      .eq('id', photoId)
      .single();

    if (photoError) throw photoError;

    // Delete from storage
    const pathMatch = photo.url.match(/verification\/[^?]+/);
    if (pathMatch) {
      await supabase.storage
        .from('verification-photos')
        .remove([pathMatch[0]])
        .catch(() => {
          /* Ignore deletion errors */
        });
    }

    // Update photo status
    const { error: updateError } = await supabase
      .from('verification_photos')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', photoId);

    if (updateError) throw updateError;

    // Send rejection email — profil lu dans `profiles` (Supabase Auth).
    const { data: userData } = await supabase
      .from('profiles')
      .select('email, username')
      .eq('id', photo.user_id)
      .single();

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
  try {
    const { data, error } = await supabase
      .from('verification_photos')
      .select('status');

    if (error) throw error;

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    data?.forEach((item: any) => {
      stats[item.status as keyof typeof stats]++;
    });

    const total = stats.pending + stats.approved + stats.rejected;
    const approvalRate = total > 0 ? (stats.approved / total) * 100 : 0;

    return {
      ...stats,
      approvalRate: Math.round(approvalRate),
    };
  } catch (error) {
    console.error('Failed to get verification stats:', error);
    return null;
  }
}
