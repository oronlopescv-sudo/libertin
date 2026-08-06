'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ChatBox } from '@/components/chat-box';
import { Store } from '@/lib/store';
import { ArrowLeft, Users, ShieldCheck } from 'lucide-react';

export default function GroupChatPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const groups = Store.getGroups();
  const group = groups.find((g) => g.id === groupId) || groups[0];

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
