/**
 * Events Service
 * Manage event creation, participation, and lifecycle
 */

import { createClient } from '@supabase/supabase-js';
import { Event, EventParticipant, EventPlanType } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Event pricing
 */
export const EVENT_PLANS: Record<EventPlanType, { price: number; duration: number; name: string }> = {
  basic: { price: 100, duration: 30, name: 'Anúncio Básico' },
  featured: { price: 150, duration: 30, name: 'Anúncio Featured' },
  vip_gold: { price: 200, duration: 60, name: 'Anúncio VIP Gold' },
};

/**
 * Create a new event listing
 */
export async function createEvent(
  creatorId: string,
  eventData: {
    type: string;
    title: string;
    description: string;
    location?: string;
    city?: string;
    date_time?: string;
    is_date_flexible: boolean;
    looking_for?: string;
    min_participants?: number;
    max_participants?: number;
    plan_type: EventPlanType;
  }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // Validate required fields
    if (!eventData.title || !eventData.description) {
      return { success: false, error: 'Título e descrição são obrigatórios' };
    }

    if (eventData.title.length < 10 || eventData.title.length > 255) {
      return { success: false, error: 'Título deve ter 10-255 caracteres' };
    }

    if (eventData.description.length < 50) {
      return { success: false, error: 'Descrição deve ter no mínimo 50 caracteres' };
    }

    // Calculate expiration
    const plan = EVENT_PLANS[eventData.plan_type];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    // Insert event
    const { data, error } = await supabase
      .from('events')
      .insert({
        creator_id: creatorId,
        type: eventData.type,
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        city: eventData.city,
        date_time: eventData.date_time,
        is_date_flexible: eventData.is_date_flexible,
        looking_for: eventData.looking_for,
        min_participants: eventData.min_participants,
        max_participants: eventData.max_participants,
        plan_type: eventData.plan_type,
        amount_paid: plan.price,
        payment_status: 'pending',
        is_active: false,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, eventId: data.id };
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, error: 'Falha ao criar anúncio' };
  }
}

/**
 * Activate event after payment
 */
export async function activateEvent(
  eventId: string,
  stripePaymentId: string,
  creatorId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('events')
      .update({
        is_active: true,
        payment_status: 'paid',
        stripe_payment_id: stripePaymentId,
      })
      .eq('id', eventId)
      .eq('creator_id', creatorId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to activate event:', error);
    return false;
  }
}

/**
 * Get active events with filters
 */
export async function getEvents(filters?: {
  type?: string;
  city?: string;
  limit?: number;
  offset?: number;
}): Promise<Event[]> {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    const { data, error } = await query.range(
      filters?.offset || 0,
      (filters?.offset || 0) + (filters?.limit || 50) - 1
    );

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get events:', error);
    return [];
  }
}

/**
 * Get event details
 */
export async function getEventDetails(eventId: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Failed to get event:', error);
    return null;
  }
}

/**
 * Join/express interest in event
 */
export async function joinEvent(
  eventId: string,
  userId: string,
  status: 'interested' | 'confirmed' = 'interested'
): Promise<boolean> {
  try {
    // Check if already joined
    const { data: existing } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()
      .catch(() => ({ data: null }));

    if (existing) {
      // Already joined
      return true;
    }

    // Add participant
    const { error } = await supabase.from('event_participants').insert({
      event_id: eventId,
      user_id: userId,
      status,
    });

    if (error) throw error;

    // Update confirmed count if confirmed
    if (status === 'confirmed') {
      await supabase.rpc('increment_event_participants', {
        event_id: eventId,
      }).catch(() => {
        /* Ignore if function doesn't exist */
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to join event:', error);
    return false;
  }
}

/**
 * Leave event
 */
export async function leaveEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to leave event:', error);
    return false;
  }
}

/**
 * Get participants for event
 */
export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get participants:', error);
    return [];
  }
}

/**
 * Renew event listing
 */
export async function renewEvent(
  eventId: string,
  creatorId: string,
  planType: EventPlanType
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await getEventDetails(eventId);

    if (!event || event.creator_id !== creatorId) {
      return { success: false, error: 'Evento não encontrado ou sem permissão' };
    }

    const plan = EVENT_PLANS[planType];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    const { error } = await supabase
      .from('events')
      .update({
        expires_at: expiresAt.toISOString(),
        payment_status: 'pending',
        plan_type: planType,
      })
      .eq('id', eventId)
      .eq('creator_id', creatorId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Failed to renew event:', error);
    return { success: false, error: 'Falha ao renovar anúncio' };
  }
}

/**
 * Get user's events
 */
export async function getUserEvents(userId: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get user events:', error);
    return [];
  }
}

/**
 * Delete event (admin or creator only)
 */
export async function deleteEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    const event = await getEventDetails(eventId);

    if (!event || event.creator_id !== userId) {
      return false;
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('creator_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to delete event:', error);
    return false;
  }
}

/**
 * Get event statistics
 */
export async function getEventStats(): Promise<{
  total: number;
  active: number;
  byType: Record<string, number>;
  byCity: Record<string, number>;
} | null> {
  try {
    const { data, error } = await supabase.from('events').select('type, city, is_active');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      active: data?.filter((e) => e.is_active).length || 0,
      byType: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
    };

    data?.forEach((event: any) => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      if (event.city) {
        stats.byCity[event.city] = (stats.byCity[event.city] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Failed to get event stats:', error);
    return null;
  }
}
