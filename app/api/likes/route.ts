import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { utilisateurPremium, utilisateurActuel } from '@/lib/auth-serveur';

/**
 * Liker un profil.
 *
 * Table `likes` : user_id, liked_user_id (uuid, référencent profiles).
 * L'ancienne version lisait le cookie mort `auth_token` et la table
 * `users` (camelCase) : elle renvoyait 401 pour tout utilisateur connecté.
 */

// POST /api/likes — liker un profil (réservé aux membres Premium)
export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('liker des profils');
    if (!auth.ok) return auth.reponse;

    const { likedUserId } = await req.json();

    if (!likedUserId) {
      return NextResponse.json({ error: "L'identifiant de l'utilisateur est requis" }, { status: 400 });
    }
    if (likedUserId === auth.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous liker vous-même' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('liked_user_id', likedUserId)
      .maybeSingle();

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', auth.user.id)
        .eq('liked_user_id', likedUserId);

      if (deleteError) {
        console.error('[likes POST delete]', deleteError);
        return NextResponse.json({ error: 'Erreur lors du retrait du like' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Like retiré', liked: false }, { status: 200 });
    }

    const { error: insertError } = await supabase
      .from('likes')
      .insert({ user_id: auth.user.id, liked_user_id: likedUserId });

    if (insertError) {
      console.error('[likes POST insert]', insertError);
      return NextResponse.json({ error: 'Erreur lors du like' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Profil liké', liked: true }, { status: 201 });
  } catch (error) {
    console.error('[likes POST]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// GET /api/likes — mes likes (ouvert à tout membre connecté)
export async function GET(req: NextRequest) {
  try {
    const auth = await utilisateurActuel();
    if (!auth.ok) return auth.reponse;

    const supabase = createServiceRoleClient();
    const { data: likes, error } = await supabase
      .from('likes')
      .select('liked_user_id')
      .eq('user_id', auth.user.id);

    if (error) {
      console.error('[likes GET]', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des likes' }, { status: 500 });
    }

    return NextResponse.json(
      { likes: likes?.map((l: { liked_user_id: string }) => l.liked_user_id) || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('[likes GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
