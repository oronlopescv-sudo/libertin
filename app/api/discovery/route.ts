import { NextRequest, NextResponse } from 'next/server';
import { utilisateurPremium } from '@/lib/auth-serveur';
import { createServiceRoleClient } from '@/lib/supabase';

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
    // Authentification + contrôle Premium côté serveur, depuis la session
    // Supabase Auth (cookie @supabase/ssr). L'ancienne version décodait le
    // cookie mort `auth_token` et lisait la table `users` (camelCase) : elle
    // renvoyait 401 pour tout utilisateur connecté avec la nouvelle auth.
    const auth = await utilisateurPremium('découvrir les profils');
    if (!auth.ok) return auth.reponse;

    const supabase = createServiceRoleClient();

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

    // Construir query com filtros — table `profiles` (snake_case).
    let query = supabase
      .from('profiles')
      .select('id, username, date_of_birth, gender, sexual_orientation, location, created_at', {
        count: 'exact',
      })
      .neq('id', auth.user.id) // Non mostrar own profile
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (location) {
      query = query.eq('location', location);
    }

    if (ageMin && ageMax) {
      // Calcular ans de nascimento baseado em idade
      const now = new Date();
      const birthYearMax = now.getFullYear() - ageMin;
      const birthYearMin = now.getFullYear() - ageMax;
      query = query
        .gte('date_of_birth', `${birthYearMin}-01-01`)
        .lte('date_of_birth', `${birthYearMax}-12-31`);
    }

    if (gender) {
      query = query.eq('gender', gender);
    }

    if (sexualOrientation) {
      query = query.eq('sexual_orientation', sexualOrientation);
    }

    // Paginaction
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('Discovery error:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des profils' }, { status: 500 });
    }

    // Calcular idade a partir de date_of_birth
    const profilesWithAge = (profiles || []).map((profile: any) => {
      const birthDate = new Date(profile.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return {
        id: profile.id,
        username: profile.username,
        gender: profile.gender,
        sexualOrientation: profile.sexual_orientation,
        location: profile.location,
        age,
      };
    });

    return NextResponse.json(
      {
        profiles: profilesWithAge,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}