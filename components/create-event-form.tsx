'use client';

import React, { useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import { useRouter } from 'next/navigation';
import { Loader, Heart, Zap, Crown } from 'lucide-react';
import { createEvent, EVENT_PLANS } from '@/lib/events';
import type { EventType, EventPlanType } from '@/lib/types';

interface CreateEventFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function CreateEventForm({ userId, onSuccess }: CreateEventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<EventPlanType>('basic');

  const [formData, setFormData] = useState({
    type: 'festa' as EventType,
    title: '',
    description: '',
    location: '',
    city: '',
    date_time: '',
    is_date_flexible: false,
    looking_for: '',
    min_participants: 2,
    max_participants: 20,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'min_participants' || name === 'max_participants' ? parseInt(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createEvent(userId, {
        ...formData,
        plan_type: planType,
      });

      if (!result.success) {
        setError(result.error || 'Échec de criar anúncio');
        setIsLoading(false);
        return;
      }

      // Redirect to checkout
      const response = await fetchResilient('/api/events/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: 'user@example.com', // Get from auth
          planType,
          eventTitle: formData.title,
        }),
      });

      if (!response.ok) {
        setError('Échec de processar pagamento');
        return;
      }

      const { checkoutUrl } = await response.json();
      router.push(checkoutUrl);
    } catch (err) {
      setError('Erreur lors de criar anúncio');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const eventTypes = [
    { value: 'festa', label: '🎉 Festa Privada' },
    { value: 'gang_bang', label: '🔥 Gang Bang' },
    { value: 'troca', label: '💑 Troca de Couples' },
    { value: 'other', label: '⭐ Outro Événement' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Event Type */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">Tipo de Événement</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4145A] transition-colors"
        >
          {eventTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">Título</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Gang Bang Paris - 8 homens procurados"
          maxLength={255}
          className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A] transition-colors"
          required
        />
        <p className="text-xs text-zinc-400 mt-1">{formData.title.length}/255</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva seu evento em detalhes. Inclua o que procura, ambiente, regras de segurança..."
          minLength={50}
          rows={5}
          className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A] transition-colors resize-none"
          required
        />
        <p className="text-xs text-zinc-400 mt-1">{formData.description.length} caracteres</p>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-white mb-2">Local</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ex: Apartamento Paris 11e"
            className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-2">Ville</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Ex: Paris"
            className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A] transition-colors"
          />
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">Data (Optionnel)</label>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <input
              type="datetime-local"
              name="date_time"
              value={formData.date_time}
              onChange={handleChange}
              className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4145A] transition-colors"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              name="is_date_flexible"
              checked={formData.is_date_flexible}
              onChange={handleChange}
              className="w-4 h-4"
            />
            Flexível
          </label>
        </div>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-white mb-2">Minimum de Participantes</label>
          <input
            type="number"
            name="min_participants"
            value={formData.min_participants}
            onChange={handleChange}
            min={1}
            className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4145A] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-2">Maximum de Participantes</label>
          <input
            type="number"
            name="max_participants"
            value={formData.max_participants}
            onChange={handleChange}
            min={1}
            className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4145A] transition-colors"
          />
        </div>
      </div>

      {/* Looking For */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">Procurando</label>
        <input
          type="text"
          name="looking_for"
          value={formData.looking_for}
          onChange={handleChange}
          placeholder="Ex: 8 homens ativos, 18-50 ans"
          className="w-full bg-[#1C102B] border border-[#3D2654] rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A] transition-colors"
        />
      </div>

      {/* Plan Selection */}
      <div>
        <label className="block text-sm font-bold text-white mb-3">Tipo de Anúncio</label>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(EVENT_PLANS) as [EventPlanType, (typeof EVENT_PLANS)['basic']][]).map(
            ([key, plan]) => (
              <label
                key={key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  planType === key
                    ? 'border-[#D4145A] bg-[#D4145A]/10'
                    : 'border-[#3D2654] bg-[#160B21] hover:border-[#D4145A]/40'
                }`}
              >
                <input
                  type="radio"
                  name="planType"
                  value={key}
                  checked={planType === key}
                  onChange={(e) => setPlanType(e.target.value as EventPlanType)}
                  className="mb-2"
                />
                <div className="font-bold text-white text-sm">{plan.name}</div>
                <div className="text-lg font-bold text-[#D4145A]">€{plan.price}</div>
                <div className="text-xs text-zinc-400">{plan.duration} jours</div>
              </label>
            )
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-950/50 border border-red-800/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold rounded-lg hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Heart className="w-5 h-5" />
            Criar Anúncio (€{EVENT_PLANS[planType].price})
          </>
        )}
      </button>
    </form>
  );
}
