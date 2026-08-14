import { NextRequest, NextResponse } from 'next/server';
import { isPremium } from '@/lib/premium';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

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

    // Busca user para verificar subscrição
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscriptionTier, subscriptionEnd')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    // ✅ VALIDAÇÃO: Apenas PREMIUM pode ver admiradores
    const userIsPremium = isPremium(user);

    if (!userIsPremium) {
      return NextResponse.json(
        { error: 'Apenas utilizadores Premium podem ver admiradores. Faça upgrade!' },
        { status: 403 }
      );
    }

    // Buscar quem curtiu você
    const { data: admirers, error } = await supabase
      .from('likes')
      .select(`
        userId,
        users:userId (
          id,
          username,
          dateOfBirth,
          gender,
          sexualOrientation,
          location,
          createdAt
        )
      `)
      .eq('likedUserId', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admirers error:', error);
      return NextResponse.json({ error: 'Erro ao buscar admiradores' }, { status: 500 });
    }

    // Formatar resposta
    const formattedAdmirers = admirers?.map((like: any) => {
      const userData = like.users;
      const birthDate = new Date(userData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return {
        id: userData.id,
        username: userData.username,
        age,
        gender: userData.gender,
        sexualOrientation: userData.sexualOrientation,
        location: userData.location,
      };
    }) || [];

    return NextResponse.json(
      { admirers: formattedAdmirers, count: formattedAdmirers.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admirers error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
