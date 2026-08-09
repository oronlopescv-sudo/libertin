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

// GET /api/admin/dashboard - Estatísticas gerais
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
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
      return NextResponse.json({ error: 'Sem permissão de admin' }, { status: 403 });
    }

    // Dashboard Stats
    const stats = {};

    // Total de users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    stats.totalUsers = totalUsers || 0;

    // Users por tier
    const { data: tierStats } = await supabase
      .from('users')
      .select('subscriptionTier');
    const tierBreakdown = {};
    tierStats?.forEach(u => {
      tierBreakdown[u.subscriptionTier] = (tierBreakdown[u.subscriptionTier] || 0) + 1;
    });
    stats.tierBreakdown = tierBreakdown;

    // Total de grupos
    const { count: totalGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });
    stats.totalGroups = totalGroups || 0;

    // Total de mensagens
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });
    stats.totalMessages = totalMessages || 0;

    // Total de likes
    const { count: totalLikes } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true });
    stats.totalLikes = totalLikes || 0;

    // Usuarios online (últimas 5 min)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: onlineUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('updatedAt', fiveMinutesAgo);
    stats.onlineUsers = onlineUsers || 0;

    // Taxa de crescimento
    const lastMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsersThisMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', lastMonthAgo);
    stats.newUsersThisMonth = newUsersThisMonth || 0;

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
