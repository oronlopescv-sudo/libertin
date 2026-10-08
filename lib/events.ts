/**
 * Events Service — criação e listagem de anúncios de eventos.
 *
 * (RLS) As duas funções pedem AGORA o cliente que o CHAMADOR usa: as rotas
 * /api/events passam o cliente autenticado por cookies da sessão, e o
 * creator_id vem sempre da sessão — nunca do browser. O antigo corpo deste
 * ficheiro usava um client anónimo global e escrevia directamente do browser
 * (creator_id falsificável); os helpers mortos (activateEvent, joinEvent,
 * renewEvent, etc.) foram removidos — activateEvent nunca tinha chamador e
 * a ativação vive no webhook (lib/stripe-webhook.ts → handleEventPaid).
 */

import type { Event, EventPlanType } from './types';

/** Mínimo do cliente Supabase que as rotas injectam (cliente da sessão). */
export type SupabaseCliente = {
  from: (t: string) => any;
};

/**
 * Event pricing — euros. Cobrança por price_data (€ × 100 → cêntimos), o
 * webhook trata da ativação com a duração aqui definida.
 */
export const EVENT_PLANS: Record<EventPlanType, { price: number; duration: number; name: string }> = {
  basic: { price: 100, duration: 30, name: 'Annonce Basique' },
  featured: { price: 150, duration: 30, name: 'Annonce Featured' },
  vip_gold: { price: 200, duration: 60, name: 'Annonce VIP Gold' },
};

/**
 * Criar um anúncio de evento. `creatorId` é o id da SESSÃO (a rota passa),
 * nunca um valor vindo do corpo do pedido.
 */
export async function createEvent(
  cliente: SupabaseCliente,
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
    if (!eventData.title || !eventData.description) {
      return { success: false, error: 'Le titre et la description sont obligatoires' };
    }

    if (eventData.title.length < 10 || eventData.title.length > 255) {
      return { success: false, error: 'Le titre doit contenir 10 à 255 caractères' };
    }

    if (eventData.description.length < 50) {
      return { success: false, error: 'La description doit contenir au minimum 50 caractères' };
    }

    const plan = EVENT_PLANS[eventData.plan_type];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    const { data, error } = await cliente
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
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, eventId: data.id };
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, error: "Échec de la création de l'annonce" };
  }
}

/**
 * Anúncios ativos com filtros (type, city, limit).
 */
export async function getEvents(
  cliente: SupabaseCliente,
  filters?: { type?: string; city?: string; limit?: number }
): Promise<Event[]> {
  try {
    let query = cliente
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
      0,
      (filters?.limit || 50) - 1
    );

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to get events:', error);
    return [];
  }
}