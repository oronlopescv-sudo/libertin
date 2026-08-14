/**
 * Anonymous Groups Service
 * Manage group membership with optional annymity
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Join group with annymity option
 */
export async function joinGroupAnonymous(
  groupId: string,
  userId: string,
  isAnonymous: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user is PREMIUM (required for annymity)
    if (isAnonymous) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { success: false, error: 'Utilisateur introuvable' };
      }

      // FREE users can't be annymous
      if (user.subscription_tier === 'FREE') {
        return { success: false, error: 'Upgrade para PREMIUM para entrar anônimo' };
      }
    }

    // Check if already member
    let existing: { id: string } | null = null;
    try {
      const result = await supabase
        .from('group_memberships')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();
      existing = result.data;
    } catch {
      existing = null;
    }

    if (existing) {
      return { success: false, error: 'Vous já é membro deste grupo' };
    }

    // Generate annymous name if needed
    let annymousName = null;
    if (isAnonymous) {
      const randomId = Math.floor(Math.random() * 9000) + 1000;
      annymousName = `Anonyme #${randomId}`;
    }

    // Join group
    const { error } = await supabase.from('group_memberships').insert({
      group_id: groupId,
      user_id: userId,
      role: 'member',
      is_annymous: isAnonymous,
      annymous_name: annymousName,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Failed to join group:', error);
    return { success: false, error: 'Échec de entrar no grupo' };
  }
}

/**
 * Get display name for a user in a group
 */
export async function getGroupMemberDisplayName(
  groupId: string,
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('group_memberships')
      .select('is_annymous, annymous_name')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error) return null;

    if (data.is_annymous) {
      return data.annymous_name;
    }

    // Get username if not annymous
    const { data: user } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    return user?.username || 'Membro';
  } catch (error) {
    console.error('Failed to get display name:', error);
    return null;
  }
}

/**
 * Get group members (with annymity handled)
 */
export async function getGroupMembers(groupId: string): Promise<
  Array<{
    id: string;
    displayName: string;
    isAnonymous: boolean;
    photoUrl?: string;
    isVerified?: boolean;
  }>
> {
  try {
    const { data: memberships, error: memberError } = await supabase
      .from('group_memberships')
      .select('user_id, is_annymous, annymous_name')
      .eq('group_id', groupId);

    if (memberError) throw memberError;

    if (!memberships) return [];

    // Get user details for non-annymous members
    const memberIds = memberships.map((m) => m.user_id);
    const { data: users } = await supabase
      .from('users')
      .select('id, username, photos, is_verified')
      .in('id', memberIds);

    const userMap = new Map(users?.map((u) => [u.id, u]) || []);

    return memberships.map((m) => {
      if (m.is_annymous) {
        return {
          id: m.user_id,
          displayName: m.annymous_name || 'Anonyme',
          isAnonymous: true,
        };
      }

      const user = userMap.get(m.user_id);
      return {
        id: m.user_id,
        displayName: user?.username || 'Membro',
        isAnonymous: false,
        photoUrl: user?.photos?.[0]?.url,
        isVerified: user?.is_verified,
      };
    });
  } catch (error) {
    console.error('Failed to get group members:', error);
    return [];
  }
}

/**
 * Check if user is annymous in group
 */
export async function isUserAnonymousInGroup(
  groupId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('group_memberships')
      .select('is_annymous')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error) return false;

    return data?.is_annymous || false;
  } catch (error) {
    console.error('Failed to check annymity:', error);
    return false;
  }
}

/**
 * Create group with 5-month expiration
 */
export async function createGroupWithExpiry(
  creatorId: string,
  groupData: {
    name: string;
    description?: string;
    is_private?: boolean;
    max_members?: number;
    category?: string;
    cover_url?: string;
    is_nsfw?: boolean;
    allows_annymous?: boolean;
  }
): Promise<{ success: boolean; groupId?: string; error?: string }> {
  try {
    // Validate name
    if (!groupData.name || groupData.name.length < 3 || groupData.name.length > 100) {
      return { success: false, error: 'Nom du groupe deve ter 3-100 caracteres' };
    }

    // Calculate expiration (5 months)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 5);

    // Get creator name
    const { data: creator } = await supabase
      .from('users')
      .select('username')
      .eq('id', creatorId)
      .single();

    // Create group
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        creator_id: creatorId,
        creator_name: creator?.username || 'Admin',
        is_private: groupData.is_private ?? true,
        max_members: groupData.max_members ?? 50,
        category: groupData.category || 'casual',
        cover_url: groupData.cover_url,
        is_nsfw: groupData.is_nsfw ?? false,
        allows_annymous: groupData.allows_annymous ?? true,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin
    await supabase.from('group_memberships').insert({
      group_id: data.id,
      user_id: creatorId,
      role: 'creator',
      is_annymous: false,
    });

    return { success: true, groupId: data.id };
  } catch (error) {
    console.error('Failed to create group:', error);
    return { success: false, error: 'Échec de criar grupo' };
  }
}

/**
 * Renew group membership (€50 for 5 more months)
 */
export async function renewGroup(
  groupId: string,
  creatorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify creator
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('creator_id')
      .eq('id', groupId)
      .single();

    if (groupError || group.creator_id !== creatorId) {
      return { success: false, error: 'Groupe introuvable ou sans autorisation' };
    }

    // Extend expiration by 5 months
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 5);

    const { error: updateError } = await supabase
      .from('groups')
      .update({
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .eq('id', groupId)
      .eq('creator_id', creatorId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Failed to renew group:', error);
    return { success: false, error: 'Échec de renovar grupo' };
  }
}

/**
 * Get expiring groups (admin)
 */
export async function getExpiringGroups(daysUntilExpiry: number = 7): Promise<any[]> {
  try {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + daysUntilExpiry);

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('is_active', true)
      .lt('expires_at', checkDate.toISOString())
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get expiring groups:', error);
    return [];
  }
}

/**
 * Deactivate expired groups (should run as cron job)
 */
export async function deactivateExpiredGroups(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('groups')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) throw error;

    console.log(`Deactivated ${data?.length || 0} expired groups`);
    return data?.length || 0;
  } catch (error) {
    console.error('Failed to deactivate expired groups:', error);
    return 0;
  }
}
