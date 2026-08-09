import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Busca user do token
    let userId: string;
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = tokenData.id;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Busca user para verificar subscrição
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscriptionTier, subscriptionEnd')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    // ✅ VALIDAÇÃO: Apenas PREMIUM pode curtir
    const premiumTiers = ['PREMIUM_3M', 'PREMIUM_12M', 'VIP_24M'];
    const isPremium = premiumTiers.includes(user.subscriptionTier) &&
      user.subscriptionEnd &&
      new Date(user.subscriptionEnd) > new Date();

    if (!isPremium) {
      return NextResponse.json(
        { error: 'Apenas utilizadores Premium podem curtir. Faça upgrade!' },
        { status: 403 }
      );
    }

    const { likedUserId } = await req.json();

    if (!likedUserId) {
      return NextResponse.json({ error: 'ID do utilizador obrigatório' }, { status: 400 });
    }

    if (likedUserId === userId) {
      return NextResponse.json({ error: 'Não podes curtir a ti mesmo' }, { status: 400 });
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
        return NextResponse.json({ error: 'Erro ao remover like' }, { status: 500 });
      }

      return NextResponse.json(
        { success: true, message: 'Like removido', liked: false },
        { status: 200 }
      );
    } else {
      // Adicionar novo like
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
        return NextResponse.json({ error: 'Erro ao curtir' }, { status: 500 });
      }

      return NextResponse.json(
        { success: true, message: 'Perfil curtido', liked: true },
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
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Busca user do token
    let userId: string;
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = tokenData.id;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Busca meus likes
    const { data: likes, error } = await supabase
      .from('likes')
      .select('likedUserId')
      .eq('userId', userId);

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar likes' }, { status: 500 });
    }

    return NextResponse.json(
      { likes: likes?.map(l => l.likedUserId) || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get likes error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
