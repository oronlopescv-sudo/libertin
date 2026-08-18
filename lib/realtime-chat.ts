'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Message } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Hook pour les messages de chat en temps réel.
 *
 * S'abonne aux changements postgres_changes sur `messages` filtrés par
 * `group_id`. La table `messages` porte le nom d'utilisateur dénormalisé
 * (`user_name`, `user_avatar`) : on n'a PAS besoin de joindre `profiles` —
 * l'ancienne version joignait `users!messages_user_id_fkey` (table inexistante,
 * la FK pointe vers `profiles`) et lisait des colonnes inexistantes
 * (`user_gender`, `user_is_verified`, `mejour_url`), ce qui faisait échouer
 * silencieusement chaque requête.
 *
 * NB : `messages` doit être membre de la publication `supabase_realtime` pour
 * que les événements postgres_changes soient émis (voir fix_everything.sql).
 */
export function useRealtimeMessages(groupId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(
          'id, content, media_url, created_at, user_id, group_id, user_name, user_avatar'
        )
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const formatted: Message[] = (data ?? []).map((msg: any) => ({
        id: msg.id,
        userId: msg.user_id,
        userName: msg.user_name ?? 'Anonyme',
        userAvatar: msg.user_avatar ?? undefined,
        groupId: msg.group_id,
        content: msg.content,
        mediaUrl: msg.media_url ?? undefined,
        createdAt: msg.created_at,
      }));

      setMessages(formatted);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Impossible de charger les messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadInitialMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Abonnement temps réel : on ajoute les nouveaux messages insérés, dédoublonnés par id.
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
          const row = payload.new as any;
          const newMessage: Message = {
            id: row.id,
            userId: row.user_id,
            userName: row.user_name ?? 'Anonyme',
            userAvatar: row.user_avatar ?? undefined,
            groupId: row.group_id,
            content: row.content,
            mediaUrl: row.media_url ?? undefined,
            createdAt: row.created_at,
          };
          setMessages((prev) =>
            prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]
          );
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
 * Envoie un message dans un groupe (client direct, clé anon + RLS).
 * Préférez la route /api/messages/[groupId] qui applique le gate Premium +
 * l'appartenance au groupe côté serveur. Cette fonction reste pour les
 * usages hors ligne principale.
 */
export async function sendMessage(
  groupId: string,
  userId: string,
  content: string,
  mediaUrl?: string
): Promise<Message | null> {
  try {
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
        media_url: mediaUrl ?? null,
      })
      .select('id, content, media_url, created_at, user_id, group_id, user_name, user_avatar')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name ?? '',
      userAvatar: data.user_avatar ?? undefined,
      groupId: data.group_id,
      content: data.content,
      mediaUrl: data.media_url ?? undefined,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    return null;
  }
}

/** Supprime un message (propriétaire uniquement). */
export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  try {
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('user_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !message || message.user_id !== userId) {
      throw new Error('Unauthorized or message not found');
    }

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

/** Modifie un message (propriétaire uniquement). */
export async function editMessage(
  messageId: string,
  userId: string,
  newContent: string
): Promise<boolean> {
  try {
    if (!newContent.trim()) {
      throw new Error('Le message ne peut pas être vide');
    }

    if (newContent.length > 2000) {
      throw new Error('Le message est trop long');
    }

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

/** Recherche les messages d'un groupe par contenu. */
export async function searchMessages(
  groupId: string,
  query: string
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(
        'id, content, media_url, created_at, user_id, group_id, user_name, user_avatar'
      )
      .eq('group_id', groupId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data ?? []).map((msg: any) => ({
      id: msg.id,
      userId: msg.user_id,
      userName: msg.user_name ?? 'Anonyme',
      userAvatar: msg.user_avatar ?? undefined,
      groupId: msg.group_id,
      content: msg.content,
      mediaUrl: msg.media_url ?? undefined,
      createdAt: msg.created_at,
    }));
  } catch (error) {
    console.error('Failed to search messages:', error);
    return [];
  }
}

/** Statistiques de messages pour un groupe. */
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