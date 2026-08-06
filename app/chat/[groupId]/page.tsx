'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ChatBox } from '@/components/chat-box';
import { getSupabaseGroups } from '@/lib/supabase';
import { Group } from '@/lib/types';
import { ArrowLeft, Users } from 'lucide-react';

export default function GroupChatPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    getSupabaseGroups().then((groups) => {
      const found = groups.find((g) => g.id === groupId) || null;
      setGroup(found);
    });
  }, [groupId]);

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col bg-[#12091A] text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-xs text-zinc-400">Chargement du groupe...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/groupes"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la liste des groupes</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Users className="w-4 h-4 text-[#E86B7A]" />
            <span>Organisé par {group.creatorName}</span>
          </div>
        </div>

        {/* Real-time Interactive Chat */}
        <ChatBox groupId={group.id} groupName={group.name} memberCount={group.memberCount} />
      </main>

      <Footer />
    </div>
  );
}
