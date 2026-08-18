'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { fetchResilient } from '@/lib/fetch-resilient';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Cloche de notifications.
 *
 * Charge les notifications au montage, écoute les changements en temps réel
 * (table `notifications` dans la publication supabase_realtime) et rafraîchit
 * automatiquement. À l'ouverture, on marque tout comme lu.
 */
export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const [chargé, setChargé] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const charger = useCallback(async () => {
    try {
      const res = await fetchResilient('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications ?? []);
        setUnread(data.unreadCount ?? 0);
      }
    } catch {
      /* silencieux */
    } finally {
      setChargé(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    charger();
  }, [user, charger]);

  // Temps réel : un insert/update sur mes notifications → recharger.
  useEffect(() => {
    if (!user?.id || !supabase) return;
    let sub: any = null;
    try {
      const channel = supabase
        .channel('notifications-bell')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => charger()
        )
        .subscribe();
      sub = channel;
    } catch {
      /* realtime indisponible — le polling visuel reste */
    }
    return () => {
      try {
        supabase?.removeChannel?.(sub);
      } catch {
        /* noop */
      }
    };
  }, [user?.id, charger]);

  // Fermer le menu quand on clique dehors.
  useEffect(() => {
    if (!ouvert) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ouvert]);

  const marquerLus = useCallback(async () => {
    if (unread === 0) return;
    setUnread(0);
    setNotifications((list) => list.map((n) => ({ ...n, is_read: true })));
    try {
      await fetchResilient('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      /* silencieux : on reverra l'état réel au prochain chargement */
    }
  }, [unread]);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOuvert((v) => !v);
          if (!ouvert) marquerLus();
        }}
        className="relative p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-[#2C1B3D] transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4145A] text-white text-[10px] font-bold flex items-center justify-center border border-[#1C102B]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[#1C102B] border border-[#3D2654] rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#2C1B3D] flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unread > 0 && (
              <span className="text-[11px] text-[#E86B7A]">{unread} non lue{unread > 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!chargé ? (
              <p className="px-4 py-6 text-sm text-zinc-500 text-center">Chargement…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-500 text-center">Aucune notification</p>
            ) : (
              notifications.map((n) => {
                const contenu = (
                  <div
                    className={`px-4 py-3 border-b border-[#2C1B3D] hover:bg-[#2C1B3D]/60 transition-colors ${
                      !n.is_read ? 'bg-[#D4145A]/8' : ''
                    }`}
                  >
                    {n.title && <p className="text-sm font-semibold text-white">{n.title}</p>}
                    {n.body && <p className="text-xs text-zinc-400 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-zinc-600 mt-1">{tempsRelatif(n.created_at)}</p>
                  </div>
                );
                return n.link ? (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setOuvert(false)}
                    className="block"
                  >
                    {contenu}
                  </Link>
                ) : (
                  <div key={n.id}>{contenu}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function tempsRelatif(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 7) return `il y a ${j} j`;
  return d.toLocaleDateString('fr-FR');
}