'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { LogOut, User, Mail } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

/**
 * Page de profil.
 *
 * Lit l'utilisateur connecté depuis le contexte d'authentification
 * (useAuth), alimenté par Supabase Auth — la source unique de vérité.
 * L'ancienne version utilisait `localStorage.getItem('user')` : comme la
 * connexion Supabase Auth n'écrit jamais dans localStorage, la page ne
 * trouvait jamais l'utilisateur et renvoyait systématiquement vers /login,
 * même juste après une connexion réussie.
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  // Pas de session valide : on renvoie vers la connexion. On n'agit que
  // quand le contexte a fini de charger pour éviter un clignotement.
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  const handleLogout = () => {
    // logout() appelle signOutWithSupabase() : invalide la session côté
    // Supabase Auth et supprime les cookies. L'ancien appel à
    // /api/auth/logout ne nettoyait que le cookie mort `auth_token` et
    // laissait la session Supabase active.
    logout();
    router.replace('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Carregando perfil...</div>
        </div>
      </div>
    );
  }

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