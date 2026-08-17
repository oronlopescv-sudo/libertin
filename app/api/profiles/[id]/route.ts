import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurActuel } from '@/lib/auth-serveur';

/**
 * GET /api/profiles/[id] — perfil público de um membro.
 *
 * Aberto a tout membre connecté (Premium ou non). Ne renvoie que les champs
 * publics (jamais email, phone, stripe_customer_id, etc.). Inclut les photos
 * de l'album et un indicateur "likedByMe" pour le bouton Like.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();

    // Profil public (champs publics uniquement).
    const { data: profil, error: profilError } = await supabase
      .from('profiles')
      .select('id, username, date_of_birth, gender, sexual_orientation, location, bio, interests, is_verified, is_nsfw, created_at')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (profilError || !profil) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    // Âge à partir de date_of_birth.
    let age: number | null = null;
    if (profil.date_of_birth) {
      const birth = new Date(profil.date_of_birth);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    }

    // Album photo (table photos).
    const { data: photos } = await supabase
      .from('photos')
      .select('id, url, is_cover, display_order')
      .eq('user_id', id)
      .order('display_order', { ascending: true });

    // Est-ce que j'ai déjà liké ce profil ?
    const { data: monLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('liked_user_id', id)
      .maybeSingle();

    return NextResponse.json(
      {
        profile: {
          id: profil.id,
          username: profil.username,
          age,
          gender: profil.gender,
          sexualOrientation: profil.sexual_orientation,
          location: profil.location,
          bio: profil.bio ?? null,
          interests: profil.interests ?? null,
          isVerified: !!profil.is_verified,
          isNsfw: !!profil.is_nsfw,
          createdAt: profil.created_at,
        },
        photos: (photos ?? []).map((p: any) => ({
          id: p.id,
          url: p.url,
          isCover: !!p.is_cover,
        })),
        likedByMe: !!monLike,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[profiles/:id GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}