'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Calendar, MapPin, Heart } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    dateOfBirth: '',
    gender: 'couple',
    sexualOrientation: 'heterosexuelle',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validações básicas
      if (!formData.email || !formData.password || !formData.username || !formData.dateOfBirth) {
        throw new Error('Tous les champs sont requis');
      }

      if (formData.password.length < 8) {
        throw new Error('Le password doit contenir au moins 8 caractères');
      }

      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 18) {
        throw new Error('Vous devez avoir au moins 18 ans');
      }

      // API call
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setSuccess(true);
      // Redirecionar para login após sucesso
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Inscription réussie!</h2>
          <p className="text-zinc-400">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
            <p className="text-zinc-400">Rejoignez la communauté xlibertine</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="w-full pl-10 pr-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Nom d'utilisateur</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full pl-10 pr-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caractères"
                  className="w-full pl-10 pr-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Date de naissance</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Profil</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="couple">Couple</option>
                <option value="femme">Femme</option>
                <option value="homme">Homme</option>
              </select>
            </div>

            {/* Sexual Orientation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Orientation</label>
              <select
                name="sexualOrientation"
                value={formData.sexualOrientation}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="heterosexuelle">Hétérosexuelle</option>
                <option value="homosexuelle">Homosexuelle</option>
                <option value="bisexuelle">Bisexuelle</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#F5F0F8]">Localisation</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-[#D4145A]/50" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ville, Pays"
                  className="w-full pl-10 pr-4 py-2 bg-[#1C102B] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>

            <div className="text-center text-sm text-zinc-400">
              Vous avez un compte? <a href="/login" className="text-[#D4145A] hover:underline">Se connecter</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
