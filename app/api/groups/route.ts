import { NextRequest, NextResponse } from 'next/server';
import { isPremium } from '@/lib/premium';
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

    const userIsPremium = isPremium(user);

    if (!userIsPremium) {
      return NextResponse.json(
        { error: 'Apenas utilizadores Premium podem criar grupos. Faça upgrade!' },
        { status: 403 }
      );
    }

    // Parse request
    const { name, description, isPrivate, maxMembers, category } = await req.json();

    // Validações básicas
    if (!name || name.length < 3) {
      return NextResponse.json({ error: 'Nome do grupo deve ter 3+ caracteres' }, { status: 400 });
    }

    // Cria grupo
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
      return NextResponse.json({ error: 'Erro ao criar grupo' }, { status: 500 });
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
      return NextResponse.json({ error: 'Erro ao buscar grupos' }, { status: 500 });
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

    const userIsPremium = isPremium(user);

    if (!userIsPremium) {
      return NextResponse.json(
        { error: 'Apenas utilizadores Premium podem participar em grupos. Faça upgrade!' },
        { status: 403 }
      );
    }

    const { groupId } = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo obrigatório' }, { status: 400 });
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
      return NextResponse.json({ error: 'Erro ao juntar-se ao grupo' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Juntou-se ao grupo com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
