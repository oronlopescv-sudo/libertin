/**
 * Admin Management API Routes
 * User banning, group moderation, analytics
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Admin check middleware
async function checkAdminAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    return !error && data?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/users - List all users with filters
 */
export async function getUsers(
  adminId: string,
  filters?: {
    status?: 'active' | 'banned' | 'unverified';
    subscription?: 'FREE' | 'PREMIUM_3M' | 'PREMIUM_12M' | 'PREMIUM_24M';
    limit?: number;
    offset?: number;
  }
) {
  if (!(await checkAdminAccess(adminId))) {
    return { error: 'Unauthorized' };
  }

  try {
    let query = supabase.from('users').select('*');

    if (filters?.status === 'banned') {
      query = query.eq('is_active', false);
    } else if (filters?.status === 'active') {
      query = query.eq('is_active', true);
    } else if (filters?.status === 'unverified') {
      query = query.eq('is_verified', false);
    }

    if (filters?.subscription) {
      query = query.eq('subscription_tier', filters.subscription);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(
        filters?.offset || 0,
        (filters?.offset || 0) + (filters?.limit || 50) - 1
      );

    if (error) throw error;

    return { users: data, total: count };
  } catch (error) {
    console.error('Failed to get users:', error);
    return { error: 'Failed to fetch users' };
  }
}

/**
 * POST /api/admin/users/:id/ban - Ban a user
 */
export async function banUser(
  adminId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await checkAdminAccess(adminId))) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Prevent self-banning
    if (adminId === userId) {
      return { success: false, error: 'Cannot ban yourself' };
    }

    // Ban the user
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the action
    try {
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: 'ban_user',
        target_id: userId,
        reason,
        created_at: new Date().toISOString(),
      });
    } catch {
      /* Log insert failure but continue */
    }

    // Send notification email
    let userData: { email: string } | null = null;
    try {
      const result = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      userData = result.data;
    } catch {
      userData = null;
    }

    if (userData?.email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: userData.email,
            subject: 'Votre compte xlibertine a été suspendu',
            html: `
              <h2>Compte suspendu</h2>
              <p>Votre compte xlibertine a été suspendu pour la raison suivante:</p>
              <p><strong>${reason}</strong></p>
              <p>Si vous pensez qu'il s'agit d'une erreur, contactez support@xlibertine.com</p>
            `,
          }),
        });
      } catch (err) {
        console.error('Failed to send ban email:', err);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to ban user:', error);
    return { success: false, error: 'Failed to ban user' };
  }
}

/**
 * POST /api/admin/users/:id/unban - Unban a user
 */
export async function unbanUser(
  adminId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await checkAdminAccess(adminId))) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the action
    try {
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: 'unban_user',
        target_id: userId,
        created_at: new Date().toISOString(),
      });
    } catch {
      /* Log insert failure but continue */
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to unban user:', error);
    return { success: false, error: 'Failed to unban user' };
  }
}

/**
 * POST /api/admin/groups/:id/flag - Flag a group for review
 */
export async function flagGroup(
  adminId: string,
  groupId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await checkAdminAccess(adminId))) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Log the flag
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'flag_group',
      target_id: groupId,
      reason,
      created_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to flag group:', error);
    return { success: false, error: 'Failed to flag group' };
  }
}

/**
 * POST /api/admin/groups/:id/delete - Delete a group
 */
export async function deleteGroup(
  adminId: string,
  groupId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await checkAdminAccess(adminId))) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Delete messages first
    await supabase.from('messages').delete().eq('group_id', groupId);

    // Delete group
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;

    // Log the action
    try {
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: 'delete_group',
        target_id: groupId,
        reason,
        created_at: new Date().toISOString(),
      });
    } catch {
      /* Log insert failure but continue */
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete group:', error);
    return { success: false, error: 'Failed to delete group' };
  }
}

/**
 * GET /api/admin/analytics - Get platform analytics
 */
export async function getAnalytics(
  adminId: string,
  period: 'day' | 'week' | 'month' = 'month'
): Promise<any> {
  if (!(await checkAdminAccess(adminId))) {
    return { error: 'Unauthorized' };
  }

  try {
    const startDate = new Date();
    if (period === 'day') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Active users (logged in this period)
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', startDate.toISOString());

    // New signups
    const { count: newSignups } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Premium subscribers
    const { count: premiumUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('subscription_tier', 'FREE')
      .gte('subscription_end', new Date().toISOString());

    // Verified users
    const { count: verifiedUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    // Total messages
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Total groups
    const { count: totalGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });

    return {
      period,
      totalUsers,
      activeUsers,
      newSignups,
      premiumUsers,
      premiumRate: totalUsers ? Math.round((premiumUsers! / totalUsers) * 100) : 0,
      verifiedUsers,
      verificationRate: totalUsers
        ? Math.round((verifiedUsers! / totalUsers) * 100)
        : 0,
      totalMessages,
      totalGroups,
    };
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return { error: 'Failed to fetch analytics' };
  }
}

/**
 * GET /api/admin/logs - Get admin action logs
 */
export async function getAdminLogs(
  adminId: string,
  limit: number = 100
): Promise<any> {
  if (!(await checkAdminAccess(adminId))) {
    return { error: 'Unauthorized' };
  }

  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { logs: data };
  } catch (error) {
    console.error('Failed to get admin logs:', error);
    return { error: 'Failed to fetch logs' };
  }
}
