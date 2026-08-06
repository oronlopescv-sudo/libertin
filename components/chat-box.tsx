'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '@/lib/types';
import { Store } from '@/lib/store';
import { useAuth } from '@/context/auth-context';
import {
  Send,
  ShieldCheck,
  Lock,
  Crown,
  Paperclip,
  Smile,
  X,
  Volume2,
  VolumeX,
  UserX,
} from 'lucide-react';
import Link from 'next/link';

interface ChatBoxProps {
  groupId: string;
  groupName: string;
  memberCount?: number;
}

export function ChatBox({ groupId, groupName, memberCount }: ChatBoxProps) {
  const { user, isPremium } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => Store.getGroupMessages(groupId));
  const [inputContent, setInputContent] = useState('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const EMOJIS = ['🥂', '🌶️', '💋', '🍸', '✨', '🔥', '🖤', '🍓', '🔒', '🌹'];

  const loadMessages = React.useCallback(() => {
    const msgs = Store.getGroupMessages(groupId);
    setMessages(msgs);
  }, [groupId]);

  useEffect(() => {
    const handleStorage = () => {
      loadMessages();
    };

    window.addEventListener('rp_storage_update', handleStorage);
    return () => window.removeEventListener('rp_storage_update', handleStorage);
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || !user) return;

    // Premium check: Free members cannot send messages (Fix #1)
    if (!isPremium && user.role !== 'admin') {
      setUpgradeModalOpen(true);
      return;
    }

    try {
      // Send via Store
      Store.sendMessage(groupId, user, inputContent);
      setInputContent('');
      loadMessages();

      // Play soft notification chime if enabled
      if (soundEnabled && typeof Audio !== 'undefined') {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 587.33; // D5
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch (e) {
          // ignore audio context restrictions
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const visibleMessages = messages.filter((msg) => {
    if (!user) return true;
    return !Store.isBlocked(user.id, msg.userId);
  });

  return (
    <div className="flex flex-col h-[600px] rounded-2xl bg-[#1C102B] border border-[#2C1B3D] shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-[#12091A] border-b border-[#2C1B3D] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4145A]/20 border border-[#D4145A]/40 flex items-center justify-center font-bold text-[#E86B7A]">
            #
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{groupName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                ● En direct
              </span>
            </h3>
            <div className="text-xs text-zinc-400">
              {memberCount || messages.length + 10} membres actifs
            </div>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg bg-[#2C1B3D] text-zinc-400 hover:text-white"
          title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#E86B7A]" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#160B21]/50">
        {visibleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
            <Lock className="w-8 h-8 text-[#D4145A]/60" />
            <p className="text-sm font-semibold text-zinc-300">
              Aucun message pour le moment dans ce tchat
            </p>
            <p className="text-xs max-w-sm">
              Soyez le premier à engager la conversation dans le respect des codes libertins !
            </p>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const isMe = msg.userId === user?.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <img
                  src={
                    msg.userAvatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={msg.userName}
                  className="w-8 h-8 rounded-full object-cover border border-[#D4145A] shrink-0"
                />

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-[10px] text-zinc-400 ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-semibold text-zinc-300 flex items-center gap-1">
                      {msg.userName}
                      {msg.userIsVerified && <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />}
                    </span>
                    <span>• {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isMe && user && (
                      <button
                        onClick={() => {
                          Store.blockUser(user.id, msg.userId);
                          loadMessages();
                        }}
                        className="text-zinc-500 hover:text-red-400 transition-colors ml-1"
                        title="Bloquer ce membre"
                      >
                        <UserX className="w-3 h-3 inline" />
                      </button>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white rounded-tr-none'
                        : 'bg-[#2C1B3D] text-zinc-200 border border-[#3D2654] rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Free User Bottom Notice Banner if not Premium */}
      {!isPremium && user?.role !== 'admin' && (
        <div className="px-4 py-2 bg-[#2C1B3D]/90 border-t border-[#3D2654] flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Compte Découverte : La participation aux tchats nécessite un Pass Premium.</span>
          </div>
          <Link
            href="/abonnements"
            className="px-2.5 py-1 rounded bg-[#D4145A] text-white font-bold text-[10px]"
          >
            S&apos;abonner
          </Link>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-[#12091A] border-t border-[#2C1B3D] relative">
        {/* Emoji Selector Popup */}
        {emojiPickerOpen && (
          <div className="absolute bottom-16 left-4 p-2 bg-[#1C102B] border border-[#3D2654] rounded-xl shadow-xl flex gap-1 z-20">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputContent((prev) => prev + emoji);
                  setEmojiPickerOpen(false);
                }}
                className="p-1.5 hover:bg-[#2C1B3D] rounded-lg text-base"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#2C1B3D]"
            title="Insérer un emoji"
          >
            <Smile className="w-5 h-5 text-[#E86B7A]" />
          </button>

          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={
              isPremium
                ? "Écrivez votre message discret..."
                : "Abonnement requis pour envoyer un message..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#1C102B] border border-[#3D2654] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
          />

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-xs hover:opacity-95 shadow-md flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </div>
      </form>

      {/* Upgrade Required Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#1C102B] border border-[#3D2654] rounded-2xl p-6 text-center text-white space-y-4">
            <button
              onClick={() => setUpgradeModalOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#D4145A]/20 border border-[#D4145A]/50 flex items-center justify-center mx-auto text-[#E86B7A]">
              <Crown className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold">Abonnement Premium Requis</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Pour maintenir la sérénité et la qualité des échanges sur nos tchats, l&apos;envoi de messages est réservé aux membres possédant un Pass Premium.
            </p>

            <div className="pt-2 space-y-2">
              <Link
                href="/abonnements"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>Débloquer les tchats (dès 2.08€/mois)</span>
              </Link>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Continuer en mode lecture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
