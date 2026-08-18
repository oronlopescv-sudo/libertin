import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { utilisateurActuel } from '@/lib/auth-serveur';
import { CITIES } from '@/lib/geo';

/**
 * GET /api/users/profile — profil éditable du membre connecté.
 * PATCH /api/users/profile — met à jour les champs publics du profil.
 *
 * Le membre est TOUJOURS déduit de la session : on ne fait jamais confiance à
 * un `userId` envoyé par le client. La mise à jour est restreinte à la ligne
 * du membre (`.eq('id', auth.user.id)`), et seuls les champs publics sont
 * acceptés — jamais email, rôle, abonnement, is_verified, stripe, etc.
 */
const GENDERS = new Set(['femme', 'homme', 'couple']);
const ORIENTATIONS = new Set(['hetero', 'homo', 'bi', 'libertin']);

function ageFromDate(iso: string): number | null {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export async function GET() {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, username, email, date_of_birth, gender, sexual_orientation, location, bio, interests, is_nsfw, is_verified'
      )
      .eq('id', auth.user.id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: data.id,
        username: data.username,
        email: data.email,
        dateOfBirth: data.date_of_birth ?? '',
        gender: data.gender ?? '',
        sexualOrientation: data.sexual_orientation ?? '',
        location: data.location ?? '',
        bio: data.bio ?? '',
        interests: Array.isArray(data.interests) ? data.interests : [],
        isNsfw: !!data.is_nsfw,
        isVerified: !!data.is_verified,
      },
    });
  } catch (error) {
    console.error('[users/profile GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const body = await req.json().catch(() => ({}));
    const update: Record<string, string | string[] | boolean | null> = {};

    if (body.bio !== undefined) {
      if (typeof body.bio !== 'string') {
        return NextResponse.json({ error: 'Bio invalide.' }, { status: 400 });
      }
      update.bio = body.bio.trim().slice(0, 1000);
    }

    if (body.interests !== undefined) {
      if (!Array.isArray(body.interests)) {
        return NextResponse.json({ error: "Centres d'intérêt invalides." }, { status: 400 });
      }
      update.interests = body.interests
        .filter((i: unknown): i is string => typeof i === 'string' && i.trim().length > 0)
        .map((i: string) => i.trim().slice(0, 40))
        .slice(0, 20);
    }

    if (body.location !== undefined) {
      if (body.location === '') {
        update.location = null;
      } else if (typeof body.location !== 'string' || !CITIES[body.location]) {
        return NextResponse.json({ error: 'Ville non reconnue.' }, { status: 400 });
      } else {
        update.location = body.location;
      }
    }

    if (body.gender !== undefined) {
      if (body.gender === '') {
        update.gender = null;
      } else if (typeof body.gender !== 'string' || !GENDERS.has(body.gender)) {
        return NextResponse.json({ error: 'Genre invalide.' }, { status: 400 });
      } else {
        update.gender = body.gender;
      }
    }

    if (body.sexualOrientation !== undefined) {
      if (body.sexualOrientation === '') {
        update.sexual_orientation = null;
      } else if (typeof body.sexualOrientation !== 'string' || !ORIENTATIONS.has(body.sexualOrientation)) {
        return NextResponse.json({ error: 'Orientation invalide.' }, { status: 400 });
      } else {
        update.sexual_orientation = body.sexualOrientation;
      }
    }

    if (body.dateOfBirth !== undefined) {
      if (body.dateOfBirth === '') {
        update.date_of_birth = null;
      } else {
        if (typeof body.dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth)) {
          return NextResponse.json({ error: 'Date de naissance invalide.' }, { status: 400 });
        }
        const age = ageFromDate(body.dateOfBirth);
        if (age === null || age < 18) {
          return NextResponse.json({ error: 'Vous devez avoir au moins 18 ans.' }, { status: 400 });
        }
        update.date_of_birth = body.dateOfBirth;
      }
    }

    if (body.isNsfw !== undefined) {
      update.is_nsfw = !!body.isNsfw;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour.' }, { status: 400 });
    }

    update.updated_at = new Date().toISOString();

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('profiles').update(update).eq('id', auth.user.id);

    if (error) {
      console.error('[users/profile PATCH]', error);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[users/profile PATCH]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}