'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { fetchResilient } from '@/lib/fetch-resilient';

export function LoginForm() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [montrerMotDePasse, setMontrerMotDePasse] = useState(false);
  // L'erreur parle-t-elle d'un e-mail non confirmé ? Alors on propose le
  // renvoi de l'e-mail au lieu de laisser la personne bloquée sans issue.
  const [erroConfirmacao, setErroConfirmacao] = useState(false);
  const [reenvio, setReenvio] = useState<'parado' | 'a-enviar' | 'enviado'>('parado');
  const [contagem, setContagem] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErroConfirmacao(false);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Email et mot de passe obligatoires');
      }

      // Passe par le contexte d'authentification (Supabase Auth), qui est la
      // source de vérité lue par le reste du site. L'ancienne version appelait
      // /api/auth/login et écrivait dans localStorage : la connexion
      // réussissait côté serveur mais le site continuait de voir un visiteur.
      // Échec: `login` lève une erreur déjà traduite en français et précise
      // le vrai motif (identifiants, e-mail non confirmé, rate limit…).
      await login(formData.email, formData.password);

      // Direct au /decouvrir après connexion — /profil demandait de
      // "re-remplir" le profil à chaque connexion (cf. retour du propriétaire).
      window.location.assign('/decouvrir');
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Connexion impossible. Réessayez.';
      setError(mensagem);
      setErroConfirmacao(mensagem.toLowerCase().includes('confirm'));
    } finally {
      setLoading(false);
    }
  };

  const reenviarEmail = async () => {
    setReenvio('a-enviar');
    try {
      const res = await fetchResilient('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setReenvio('enviado');
        setContagem(60);
        const horario = setInterval(() => {
          setContagem(c => {
            if (c <= 1) {
              clearInterval(horario);
              setReenvio('parado');
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      } else {
        setError(data.error || "Le renvoi de l'e-mail a échoué.");
        setReenvio('parado');
      }
    } catch {
      setError("Le renvoi de l'e-mail a échoué.");
      setReenvio('parado');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Se Connecter</h1>
            <p className="text-zinc-400">Ravi de vous revoir</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm space-y-2"
              >
                <p>{error}</p>
                {erroConfirmacao && (
                  <button
                    type="button"
                    onClick={reenviarEmail}
                    disabled={reenvio !== 'parado'}
                    className="inline-flex items-center gap-1.5 text-[#E86B7A] font-semibold hover:underline disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${reenvio === 'a-enviar' ? 'animate-spin' : ''}`}
                    />
                    {reenvio === 'a-enviar' && "Renvoi en cours…"}
                    {reenvio === 'enviado' &&
                      `Renvoyé — regardez vos e-mails${contagem > 0 ? ` (${contagem}s)` : ''}`}
                    {reenvio === 'parado' && "Renvoyer l'e-mail de confirmation"}
                  </button>
                )}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-[#F5F0F8]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor="login-password" className="text-sm font-medium text-[#F5F0F8]">
                  Mot de passe
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-zinc-400 hover:text-[#E86B7A] transition-colors"
                >
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  id="login-password"
                  type={montrerMotDePasse ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  className="w-full pl-10 pr-11 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
                <button
                  type="button"
                  onClick={() => setMontrerMotDePasse(v => !v)}
                  aria-label={montrerMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-2 top-1 p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  {montrerMotDePasse ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>

            <div className="text-center text-sm text-zinc-400">
              <a
                href="/forgot-password"
                className="block w-full mb-3 py-2.5 border border-[#3C2B4D] rounded-lg text-[#E86B7A] font-semibold hover:bg-[#2C1B3D] hover:border-[#D4145A]/60 transition"
              >
                Mot de passe oublié ?
              </a>
              Pas encore de compte ?{' '}
              <a href="/register" className="text-[#E86B7A] font-semibold hover:underline">
                Créer un compte
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}