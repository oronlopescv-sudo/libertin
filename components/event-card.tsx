'use client';

import React from 'react';
import { Calendar, MapPin, Users, Heart, Eye, Loader2 } from 'lucide-react';
import { Event } from '@/lib/types';

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  isJoined?: boolean;
  busy?: boolean;
}

export function EventCard({ event, onJoin, onLeave, isJoined, busy }: EventCardProps) {
  const eventTypes: Record<string, string> = {
    festa: '🎉 Fête Privée',
    gang_bang: '🔥 Gang Bang',
    troca: '💑 Échange de Couples',
    other: '⭐ Autre Événement',
  };

  const planIcons: Record<string, string> = {
    basic: '📢',
    featured: '⭐',
    vip_gold: '👑',
  };

  const daysUntilExpiry = event.expires_at
    ? Math.ceil((new Date(event.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-[#1C102B] border border-[#2C1B3D] rounded-2xl overflow-hidden hover:border-[#D4145A]/40 transition-all">
      {/* Header */}
      <div className="p-4 bg-[#160B21] border-b border-[#2C1B3D]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{eventTypes[event.type as keyof typeof eventTypes] || event.type}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[#D4145A]/20 text-[#E86B7A]">
                {planIcons[event.plan_type as keyof typeof planIcons]} {event.plan_type === 'basic' ? 'Basique' : event.plan_type === 'featured' ? 'Featured' : 'VIP Gold'}
              </span>
            </div>
            <h3 className="font-bold text-white text-lg leading-tight">{event.title}</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <p className="text-sm text-zinc-300 line-clamp-2">{event.description}</p>

        {/* Details */}
        <div className="space-y-2 text-xs text-zinc-400">
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4145A]" />
              <span>{event.location}</span>
            </div>
          )}

          {event.date_time && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4145A]" />
              <span>{new Date(event.date_time).toLocaleDateString('fr-FR')}</span>
            </div>
          )}

          {event.looking_for && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4145A]" />
              <span>{event.looking_for}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-[#2C1B3D]">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {/* O contador é de INSCRIÇÕES (status interested) — não eram
                "confirmados"; chamava-se confirmé e enganava. */}
            {event.confirmed_count} intéressé{event.confirmed_count !== 1 ? 's' : ''}
          </span>
          {daysUntilExpiry > 0 && (
            <span className={daysUntilExpiry < 7 ? 'text-amber-400' : 'text-zinc-400'}>
              Expire dans {daysUntilExpiry} jours
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-[#160B21] border-t border-[#2C1B3D] flex gap-2">
        {/* Toggle : cliquer s'inscrit (ou retire l'inscription si déjà fait). */}
        <button
          onClick={() => (isJoined ? onLeave?.(event.id) : onJoin?.(event.id))}
          disabled={busy}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-50 ${
            isJoined
              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 hover:text-emerald-200'
              : 'bg-[#D4145A] text-white hover:bg-[#B50E4A]'
          }`}
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Modification…</span>
            </>
          ) : isJoined ? (
            <>
              <Heart className="w-4 h-4 fill-emerald-300" />
              <span>Intéressé ✓ — retirer</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4" />
              <span>Intéressé</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
