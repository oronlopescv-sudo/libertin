'use client';

import React from 'react';
import Link from 'next/link';
import { Group } from '@/lib/types';
import { Users, Lock, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  isMember?: boolean;
}

export function GroupCard({ group, onJoin, isMember }: GroupCardProps) {
  const categoryLabels: Record<string, string> = {
    clubs: 'Clubs & Soirées',
    soirees: 'Soirées Privées',
    discretion: 'Conseils & Discrétion',
    aventure: 'Aventures & Rencontres',
    casual: 'Général Libertin',
  };

  return (
    <div className="group rounded-2xl bg-[#1C102B] border border-[#2C1B3D] hover:border-[#D4145A]/50 transition-all duration-300 overflow-hidden shadow-lg flex flex-col justify-between">
      {/* Cover Image */}
      <div className="relative h-36 w-full overflow-hidden bg-[#2C1B3D]">
        <img
          src={
            group.coverUrl ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
          }
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C102B] via-transparent to-black/40" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#D4145A] text-white uppercase tracking-wider shadow-md">
            {categoryLabels[group.category] || 'Groupe Libertin'}
          </span>

          {group.isPrivate && (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Privé</span>
            </span>
          )}
        </div>

        {/* Members Badge */}
        <div className="absolute bottom-3 left-3 text-xs font-semibold text-white flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md">
          <Users className="w-3.5 h-3.5 text-[#E86B7A]" />
          <span>
            {group.memberCount} / {group.maxMembers} membres
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-[#E86B7A] transition-colors leading-snug">
            {group.name}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {group.description || 'Espace privé d\'échange et d\'organisation de rencontres.'}
          </p>
        </div>

        {/* Creator Info */}
        <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-2 border-t border-[#2C1B3D]">
          <span>Créé par <strong className="text-zinc-300 font-medium">{group.creatorName}</strong></span>
          <span title="Organisateur Vérifié">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2">
          <Link
            href={`/chat/${group.id}`}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Rejoindre le Tchat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
