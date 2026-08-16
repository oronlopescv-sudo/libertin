import { NextRequest, NextResponse } from 'next/server';
import { utilisateurAdmin } from '@/lib/auth-serveur';
import { createServiceRoleClient } from '@/lib/supabase';

/** Map a profiles row (snake_case) to the camelCase shape attendue par l'UI admin. */
function mapUser(row: any) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    subscriptionTier: row.subscription_tier,
    subscriptionEnd: row.subscription_end,
    isVerified: row.is_verified,
    createdAt: row.created_at,
    isBanned: !row.is_active,
  };
}

// GET /api/admin/users — liste tous les profils (admin uniquement)
export async function GET(req: NextRequest) {
  try {
    const auth = await utilisateurAdmin();
    if (!auth.ok) return auth.reponse;

    const supabase = createServiceRoleClient();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const tier = searchParams.get('tier');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('id, username, email, subscription_tier, subscription_end, is_verified, is_active, created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (tier) {
      query = query.eq('subscription_tier', tier);
    }

    const { data: profiles, count } = await query;

    return NextResponse.json(
      {
        users: (profiles ?? []).map(mapUser),
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
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// POST /api/admin/users — bannir un utilisateur (is_active = false)
export async function POST(req: NextRequest) {
  try {
    const auth = await utilisateurAdmin();
    if (!auth.ok) return auth.reponse;

    const { userId, reason } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId obligatoire' }, { status: 400 });
    }
    if (userId === auth.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous bannir vous-même' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Ban error:', error);
      return NextResponse.json({ error: 'Erreur lors du bannissement' }, { status: 500 });
    }

    await supabase.from('admin_logs').insert({
      admin_id: auth.user.id,
      action: 'BAN_USER',
      target_id: userId,
      reason: reason || 'Aucune raison précisée',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Utilisateur banni avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Ban user error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// DELETE /api/admin/users?userId=... — lever le bannissement (is_active = true)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await utilisateurAdmin();
    if (!auth.ok) return auth.reponse;

    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId obligatoire' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Unban error:', error);
      return NextResponse.json({ error: 'Erreur lors du débannissement' }, { status: 500 });
    }

    await supabase.from('admin_logs').insert({
      admin_id: auth.user.id,
      action: 'UNBAN_USER',
      target_id: userId,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Utilisateur débanni avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Unban user error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}