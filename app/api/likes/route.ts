import { NextRequest, NextResponse } from 'next/server';
import { isPremium } from '@/lib/premium';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupère user do token
    let userId: string;
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = tokenData.id;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Récupère l'utilisateur pour vérifier l'abonnement
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscriptionTier, subscriptionEnd')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // ✅ VALIDAÇÃO: Apenas PREMIUM pode curtir
    const userIsPremium = isPremium(user);

    if (!userIsPremium) {
      return NextResponse.json(
        { error: 'Seuls les membres Premium peuvent liker. Passez à Premium !' },
        { status: 403 }
      );
    }

    const { likedUserId } = await req.json();

    if (!likedUserId) {
      return NextResponse.json({ error: 'ID do utilisateur obligatoire' }, { status: 400 });
    }

    if (likedUserId === userId) {
      return NextResponse.json({ error: 'Non podes curtir a ti mesmo' }, { status: 400 });
    }

    // Verificar se já existe like
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('userId', userId)
      .eq('likedUserId', likedUserId)
      .single();

    if (existingLike) {
      // Se já existe, removar (unlike)
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('userId', userId)
        .eq('likedUserId', likedUserId);

      if (deleteError) {
        return NextResponse.json({ error: 'Erreur lors de remover like' }, { status: 500 });
      }

      return NextResponse.json(
        { success: true, message: 'Like removido', liked: false },
        { status: 200 }
      );
    } else {
      // Ajouter novo like
      const { error: insertError } = await supabase
        .from('likes')
        .insert([
          {
            userId,
            likedUserId,
          }
        ]);

      if (insertError) {
        console.error('Like error:', insertError);
        return NextResponse.json({ error: 'Erreur lors de curtir' }, { status: 500 });
      }

      return NextResponse.json(
        { success: true, message: 'Profil curtido', liked: true },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// GET /api/likes - Ver meus likes
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupère user do token
    let userId: string;
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = tokenData.id;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Récupère meus likes
    const { data: likes, error } = await supabase
      .from('likes')
      .select('likedUserId')
      .eq('userId', userId);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des likes' }, { status: 500 });
    }

    return NextResponse.json(
      { likes: likes?.map((l: { likedUserId: string }) => l.likedUserId) || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get likes error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
