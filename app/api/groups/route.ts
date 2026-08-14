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

    const userIsPremium = isPremium(user);

    if (!userIsPremium) {
      return NextResponse.json(
        { error: 'Seuls les membres Premium peuvent créer des groupes. Passez à Premium !' },
        { status: 403 }
      );
    }

    // Parse request
    const { name, description, isPrivate, maxMembers, category } = await req.json();

    // Validações básicas
    if (!name || name.length < 3) {
      return NextResponse.json({ error: 'Nom du groupe deve ter 3+ caracteres' }, { status: 400 });
    }

    // Crée grupo
    const { data: group, error: createError } = await supabase
      .from('groups')
      .insert([
        {
          name,
          description: description || '',
          creatorId: userId,
          isPrivate: isPrivate || false,
          maxMembers: maxMembers || 100,
          category: category || 'general',
          isActive: true,
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Group creation error:', createError);
      return NextResponse.json({ error: 'Erreur lors de la création du groupe' }, { status: 500 });
    }

    // Adiciona creator como member
    await supabase
      .from('group_memberships')
      .insert([
        {
          groupId: group.id,
          userId: userId,
          role: 'admin',
        }
      ]);

    return NextResponse.json(
      { success: true, group },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// GET /api/groups - Listar grupos (todos podem ver)
export async function GET(req: NextRequest) {
  try {
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des groupes' }, { status: 500 });
    }

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/groups/join - Juntar-se a grupo (apenas PREMIUM)
export async function PATCH(req: NextRequest) {
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

    const userIsPremium = isPremium(user);

    if (!userIsPremium) {
      return NextResponse.json(
        { error: 'Seuls les membres Premium peuvent rejoindre des groupes. Passez à Premium !' },
        { status: 403 }
      );
    }

    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo obligatoire' }, { status: 400 });
    }

    // Adiciona user ao grupo
    const { error: joinError } = await supabase
      .from('group_memberships')
      .insert([
        {
          groupId,
          userId,
          role: 'member',
        }
      ]);

    if (joinError) {
      console.error('Join group error:', joinError);
      return NextResponse.json({ error: 'Erreur lors de juntar-se ao grupo' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Juntou-se ao grupo avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
