'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Message, Group } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Hook for real-time chat messages
 * Subscribes to message changes in a group
 */
export function useRealtimeMessages(groupId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial messages
  useEffect(() => {
    loadInitialMessages();
  }, [groupId]);

  const loadInitialMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          media_url,
          created_at,
          user_id,
          group_id,
          users!messages_user_id_fkey (
            id,
            username,
            gender,
            is_verified
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedMessages = data?.map((msg: any) => ({
        id: msg.id,
        userId: msg.user_id,
        userName: msg.users?.username || 'Anonyme',
        userGender: msg.users?.gender,
        userIsVerified: msg.users?.is_verified,
        groupId: msg.group_id,
        content: msg.content,
        mediaUrl: msg.media_url,
        createdAt: msg.created_at,
      })) || [];

      setMessages(formattedMessages);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Impossible de charger les messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newMessage = {
            id: payload.new.id,
            userId: payload.new.user_id,
            userName: payload.new.user_name || 'Anonyme',
            userGender: payload.new.user_gender,
            userIsVerified: payload.new.user_is_verified,
            groupId: payload.new.group_id,
            content: payload.new.content,
            mediaUrl: payload.new.media_url,
            createdAt: payload.new.created_at,
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return { messages, isLoading, error, refresh: loadInitialMessages };
}

/**
 * Hook for online user presence
 * Shows which users are currently in a group
 */
export function usePresence(groupId: string) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Create presence channel
    const channel = supabase.channel(`presence-${groupId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userIds = new Set<string>();

        Object.values(state).forEach((users) => {
          if (Array.isArray(users)) {
            users.forEach((user: any) => {
              if (user.user_id) {
                userIds.add(user.user_id);
              }
            });
          }
        });

        setOnlineUsers(userIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (presence.user_id) {
            setOnlineUsers((prev) => new Set([...prev, presence.user_id]));
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          if (presence.user_id) {
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              next.delete(presence.user_id);
              return next;
            });
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get current user ID and announce presence
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user?.id) {
            await channel.track({
              user_id: authData.user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return { onlineUsers };
}

/**
 * Send a message to a group
 */
export async function sendMessage(
  groupId: string,
  userId: string,
  content: string,
  mediaUrl?: string
): Promise<Message | null> {
  try {
    // Validate content
    if (!content.trim()) {
      throw new Error('Le message ne peut pas être vide');
    }

    if (content.length > 2000) {
      throw new Error('Le message est trop long (max 2000 caractères)');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        content: content.trim(),
        media_url: mediaUrl,
      })
      .select(
        `
        id,
        content,
        media_url,
        created_at,
        user_id,
        group_id
      `
      )
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      userName: '', // Will be filled by realtime
      groupId: data.group_id,
      content: data.content,
      mediaUrl: data.media_url,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    return null;
  }
}

/**
 * Delete a message (owner only)
 */
export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  try {
    // First check if user owns the message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('user_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !message || message.user_id !== userId) {
      throw new Error('Unauthorized or message not found');
    }

    // Delete the message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Failed to delete message:', error);
    return false;
  }
}

/**
 * Edit a message (owner only)
 */
export async function editMessage(
  messageId: string,
  userId: string,
  newContent: string
): Promise<boolean> {
  try {
    // Validate new content
    if (!newContent.trim()) {
      throw new Error('Le message ne peut pas être vide');
    }

    if (newContent.length > 2000) {
      throw new Error('Le message est trop long');
    }

    // Check ownership and update
    const { error } = await supabase
      .from('messages')
      .update({ content: newContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to edit message:', error);
    return false;
  }
}

/**
 * Search messages in a group
 */
export async function searchMessages(
  groupId: string,
  query: string
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        media_url,
        created_at,
        user_id,
        group_id,
        users!messages_user_id_fkey (
          id,
          username
        )
      `)
      .eq('group_id', groupId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data || []).map((msg: any) => ({
      id: msg.id,
      userId: msg.user_id,
      userName: msg.users?.username || 'Anonyme',
      groupId: msg.group_id,
      content: msg.content,
      mediaUrl: msg.media_url,
      createdAt: msg.created_at,
    }));
  } catch (error) {
    console.error('Failed to search messages:', error);
    return [];
  }
}

/**
 * Get message statistics for a group
 */
export async function getMessageStats(groupId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, created_at')
      .eq('group_id', groupId);

    if (error) throw error;

    const totalMessages = data?.length || 0;
    const messagesLast24h = (data || []).filter((msg: any) => {
      const msgDate = new Date(msg.created_at);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return msgDate > oneDayAgo;
    }).length;

    return { totalMessages, messagesLast24h };
  } catch (error) {
    console.error('Failed to get message stats:', error);
    return { totalMessages: 0, messagesLast24h: 0 };
  }
}
