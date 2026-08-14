'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { LogOut, User, Mail } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  username: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Carregando perfil...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#1C102B] border border-[#2C1B3D] rounded-2xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white">Meu Profil</h1>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-[#D4145A]" />
              <div>
                <p className="text-zinc-400 text-sm">Usuário</p>
                <p className="text-white font-semibold">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-[#D4145A]" />
              <div>
                <p className="text-zinc-400 text-sm">Email</p>
                <p className="text-white font-semibold">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2C1B3D]">
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
