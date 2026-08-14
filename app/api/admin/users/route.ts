import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Verificar se é admin
async function isAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('subscriptionTier')
    .eq('id', userId)
    .single();

  return user && ['VIP_24M'].includes(user.subscriptionTier);
}

// GET /api/admin/users - Listar todos users
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let userId: string;
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = tokenData.id;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se é admin
    const admin = await isAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: 'Sans autorisation de admin' }, { status: 403 });
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const tier = searchParams.get('tier');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, username, email, subscriptionTier, subscriptionEnd, isVerified, createdAt, isBanned', {
        count: 'exact'
      })
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (tier) {
      query = query.eq('subscriptionTier', tier);
    }

    const { data: users, count } = await query;

    return NextResponse.json(
      {
        users: users || [],
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
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/admin/users/ban - Bannir user
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let adminId: string;
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      adminId = tokenData.id;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se é admin
    const admin = await isAdmin(adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Sans autorisation de admin' }, { status: 403 });
    }

    const { userId, reason } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId obligatoire' }, { status: 400 });
    }

    if (userId === adminId) {
      return NextResponse.json({ error: 'Non podes bannir a ti mesmo' }, { status: 400 });
    }

    // Bannir user
    const { error } = await supabase
      .from('users')
      .update({ isBanned: true })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de bannir user' }, { status: 500 });
    }

    // S'inscrire action no log
    await supabase.from('admin_logs').insert([
      {
        adminId,
        action: 'BAN_USER',
        targetId: userId,
        reason: reason || 'Aucune raison précisée',
        timestamp: new Date().toISOString()
      }
    ]);

    return NextResponse.json(
      { success: true, message: 'User banni avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ban user error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE /api/admin/users/:userId - Unban user
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let adminId: string;
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      adminId = tokenData.id;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se é admin
    const admin = await isAdmin(adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Sans autorisation de admin' }, { status: 403 });
    }

    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId obligatoire' }, { status: 400 });
    }

    // Unban user
    const { error } = await supabase
      .from('users')
      .update({ isBanned: false })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de desbannir user' }, { status: 500 });
    }

    // S'inscrire action
    await supabase.from('admin_logs').insert([
      {
        adminId,
        action: 'UNBAN_USER',
        targetId: userId,
        timestamp: new Date().toISOString()
      }
    ]);

    return NextResponse.json(
      { success: true, message: 'User desblanido avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unban user error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
