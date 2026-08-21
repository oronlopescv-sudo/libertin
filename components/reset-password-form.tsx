'use client';

import React, { useEffect, useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    const e = searchParams.get('email');

    if (!t || !e) {
      setError('Lien de réinitialisation invalide ou expiré');
      return;
    }

    setToken(t);
    setEmail(decodeURIComponent(e));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!password || !confirmPassword) {
        throw new Error('Les deux mots de passe sont obligatoires');
      }

      if (password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      if (password !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      const res = await fetchResilient('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation du mot de passe');
      }

      setSuccess(true);
      // Redirection vers la connexion après 2 secondes
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Lien invalide</h2>
          <p className="text-zinc-400">Le lien de réinitialisation a expiré ou est invalide.</p>
          <a
            href="/login"
            className="inline-block py-2 px-6 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Mot de passe réinitialisé !</h2>
            <p className="text-zinc-400 mt-2">Vous serez redirigé vers la page de connexion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Réinitialiser le mot de passe</h1>
            <p className="text-zinc-400">Créez un nouveau mot de passe sécurisé</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Nova Mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  className="w-full pl-10 pr-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="w-full pl-10 pr-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
