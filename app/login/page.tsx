'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/context/auth-context';
import { Flame, Lock, ShieldCheck, Mail, Key, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, usersList, switchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Veuillez renseigner votre adresse e-mail et votre mot de passe.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push('/decouvrir');
    } else {
      setErrorMsg('Adresse email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-[#1C102B] border border-[#2C1B3D] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4145A] to-[#E86B7A] flex items-center justify-center mx-auto shadow-lg shadow-[#D4145A]/25">
              <Flame className="w-7 h-7 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Espace Membre</h1>
            <p className="text-xs text-zinc-400">
              Connectez-vous pour accéder à la communauté libertine
            </p>
          </div>

          {/* Quick Access Account Selector */}
          <div className="p-3 rounded-2xl bg-[#2C1B3D]/80 border border-[#3D2654] space-y-2">
            <div className="text-[11px] font-bold text-[#E86B7A] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Accès Membres Express</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {usersList.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    router.push('/decouvrir');
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#12091A] hover:bg-[#D4145A]/20 border border-[#3D2654] hover:border-[#D4145A] text-left text-xs transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-white group-hover:text-[#E86B7A] flex items-center gap-1">
                      {u.username}
                      {u.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-zinc-400 capitalize">
                      {u.gender} • {u.location}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      u.subscriptionTier === 'FREE'
                        ? 'bg-zinc-700 text-zinc-300'
                        : 'bg-[#D4145A] text-white'
                    }`}
                  >
                    {u.subscriptionTier}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Adresse E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.fr"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-300 font-medium">Mot de passe</label>
                <span className="text-[10px] text-zinc-400 hover:underline cursor-pointer">
                  Oublié ?
                </span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-[#D4145A]/25 flex items-center justify-center gap-2"
            >
              <span>Se Connecter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer link */}
          <div className="text-center text-xs text-zinc-400 pt-2 border-t border-[#2C1B3D]">
            Pas encore membre ?{' '}
            <Link href="/register" className="text-[#E86B7A] font-bold hover:underline">
              Créer un compte discret
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
