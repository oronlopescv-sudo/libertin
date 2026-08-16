import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { utilisateurPremium } from '@/lib/auth-serveur';

/**
 * GET /api/admirers — voir qui vous a liké (réservé aux membres Premium).
 * Table `likes` : user_id / liked_user_id (uuid, référencent profiles).
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await utilisateurPremium('voir leurs admirateurs');
    if (!auth.ok) return auth.reponse;

    const supabase = createServiceRoleClient();
    const { data: admirers, error } = await supabase
      .from('likes')
      .select(
        `
        user_id,
        profiles:user_id (
          id,
          username,
          date_of_birth,
          gender,
          sexual_orientation,
          location
        )
      `
      )
      .eq('liked_user_id', auth.user.id)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('[admirers]', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des admirateurs' }, { status: 500 });
    }

    const formattedAdmirers =
      admirers?.map((like: any) => {
        const p = like.profiles;
        const birthDate = p?.date_of_birth ? new Date(p.date_of_birth) : null;
        let age: number | null = null;
        if (birthDate) {
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        }
        return {
          id: p?.id,
          username: p?.username,
          age,
          gender: p?.gender,
          sexualOrientation: p?.sexual_orientation,
          location: p?.location,
        };
      }) || [];

    return NextResponse.json(
      { admirers: formattedAdmirers, count: formattedAdmirers.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[admirers]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
