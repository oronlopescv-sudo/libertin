import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/groups — liste publique des groupes.
 *
 * La création de groupe se fait sur /api/groups/create et la rejoignance sur
 * /api/groups/[id]/join (toutes deux authentifiées + Premium via la session).
 * Les anciens handlers POST/PATCH ici écrivaient des colonnes camelCase
 * inexistantes (creatorId, isPrivate, maxMembers, isActive...) dans le
 * schéma snake_case : ils échouaient silencieusement et doublonnaient les
 * nouvelles routes. Supprimés.
 */
export async function GET(req: NextRequest) {
  try {
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[groups GET]', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des groupes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error) {
    console.error('[groups GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}