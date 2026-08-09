import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

interface FilterParams {
  location?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  sexualOrientation?: string;
  page?: number;
}

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

    // ✅ VALIDAÇÃO: Apenas PREMIUM pode ver perfis
    const premiumTiers = ['PREMIUM_3M', 'PREMIUM_12M', 'VIP_24M'];
    const isPremium = premiumTiers.includes(user.subscriptionTier) &&
      user.subscriptionEnd &&
      new Date(user.subscriptionEnd) > new Date();

    if (!isPremium) {
      return NextResponse.json(
        { error: 'Apenas utilizadores Premium podem descobrir perfis. Faça upgrade!' },
        { status: 403 }
      );
    }

    // Parse filtros dos query params
    const searchParams = req.nextUrl.searchParams;
    const location = searchParams.get('location');
    const ageMin = searchParams.get('ageMin') ? parseInt(searchParams.get('ageMin')!) : 18;
    const ageMax = searchParams.get('ageMax') ? parseInt(searchParams.get('ageMax')!) : 99;
    const gender = searchParams.get('gender');
    const sexualOrientation = searchParams.get('sexualOrientation');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Construir query com filtros
    let query = supabase
      .from('users')
      .select('id, username, dateOfBirth, gender, sexualOrientation, location, createdAt', {
        count: 'exact'
      })
      .neq('id', userId)  // Não mostrar own profile
      .eq('isVerified', true)  // Mostrar só verified
      .order('createdAt', { ascending: false });

    // Aplicar filtros
    if (location) {
      query = query.eq('location', location);
    }

    if (ageMin && ageMax) {
      // Calcular anos de nascimento baseado em idade
      const now = new Date();
      const birthYearMax = now.getFullYear() - ageMin;
      const birthYearMin = now.getFullYear() - ageMax;
      query = query.gte('dateOfBirth', `${birthYearMin}-01-01`).lte('dateOfBirth', `${birthYearMax}-12-31`);
    }

    if (gender) {
      query = query.eq('gender', gender);
    }

    if (sexualOrientation) {
      query = query.eq('sexualOrientation', sexualOrientation);
    }

    // Paginação
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('Discovery error:', error);
      return NextResponse.json({ error: 'Erro ao buscar perfis' }, { status: 500 });
    }

    // Calcular idade a partir de dateOfBirth
    const profilesWithAge = (profiles || []).map(profile => {
      const birthDate = new Date(profile.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return {
        ...profile,
        age,
        dateOfBirth: undefined  // Não enviar data exata por privacidade
      };
    });

    return NextResponse.json(
      {
        profiles: profilesWithAge,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
