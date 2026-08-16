'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { Lock, Heart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface Profile {
  id: string;
  username: string;
  age: number;
  gender: string;
  sexualOrientation: string;
  location: string;
}

export default function Decouvrir() {
  // Utilisateur connecté depuis le contexte d'authentification (Supabase Auth).
  // L'ancienne version décodait `localStorage.auth_token` (base64 + Buffer) :
  // jeton mort, jamais écrit par la nouvelle auth, et Buffer indéfini dans le
  // navigateur — la page voyait toujours un visiteur, même connecté.
  const { user, isPremium, isLoading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  
  // Filtres
  const [location, setLocation] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(60);
  const [gender, setGender] = useState('');
  const [orientation, setOrientation] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Buscar perfis (réservé Premium)
        if (isPremium) {
          const params = new URLSearchParams();
          if (location) params.append('location', location);
          if (ageMin) params.append('ageMin', String(ageMin));
          if (ageMax) params.append('ageMax', String(ageMax));
          if (gender) params.append('gender', gender);
          if (orientation) params.append('sexualOrientation', orientation);
          params.append('page', String(page));

          const res = await fetch(`/api/discovery?${params.toString()}`);
          const data = await res.json();
          if (res.ok) {
            setProfiles(data.profiles);
          }

          // Buscar meus likes
          const likesRes = await fetch('/api/likes');
          const likesData = await likesRes.json();
          if (likesRes.ok) {
            setLikedUsers(new Set(likesData.likes));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isPremium, location, ageMin, ageMax, gender, orientation, page]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-white">
          Chargement...
        </div>
      </div>
    );
  }

  // Tous os utilisateurs autenticados podem ver perfis.
  // La règle Premium s'applique uniquement à l'envoi de messages.
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-[#D4145A]/20 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-[#D4145A]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Découvrir les profils</h1>
              <p className="text-zinc-400 mb-6">
                Connectez-vous pour découvrir les profils de la communauté.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block py-3 px-6 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition"
              >
                Se connecter
              </Link>
              <Link
                href="/"
                className="block py-3 px-6 bg-[#2C1B3D] rounded-lg font-semibold text-white hover:bg-[#3C2B4D] transition"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLike = async (profileId: string) => {
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likedUserId: profileId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.liked) {
        setLikedUsers(new Set([...likedUsers, profileId]));
      } else {
        const newLiked = new Set(likedUsers);
        newLiked.delete(profileId);
        setLikedUsers(newLiked);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Découvrir les profils</h1>

        {/* Filtres */}
        <div className="bg-[#1C102B] rounded-lg p-6 border border-[#2C1B3D] mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Localisation */}
            <div>
              <label className="text-sm text-zinc-400">Localisation</label>
              <select
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                className="w-full mt-1 px-3 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="">Toutes</option>
                <option value="Paris">Paris</option>
                <option value="Lyon">Lyon</option>
                <option value="Bordeaux">Bordeaux</option>
                <option value="Côte d'Azur">Côte d'Azur</option>
                <option value="Bruxelas">Bruxelas</option>
                <option value="Luxembourg">Luxembourg</option>
              </select>
            </div>

            {/* Âge Min */}
            <div>
              <label className="text-sm text-zinc-400">Âge Min: {ageMin}</label>
              <input
                type="range"
                min="18"
                max="99"
                value={ageMin}
                onChange={(e) => { setAgeMin(parseInt(e.target.value)); setPage(1); }}
                className="w-full mt-1"
              />
            </div>

            {/* Âge Max */}
            <div>
              <label className="text-sm text-zinc-400">Âge Max: {ageMax}</label>
              <input
                type="range"
                min="18"
                max="99"
                value={ageMax}
                onChange={(e) => { setAgeMax(parseInt(e.target.value)); setPage(1); }}
                className="w-full mt-1"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="text-sm text-zinc-400">Genre</label>
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setPage(1); }}
                className="w-full mt-1 px-3 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="">Tous</option>
                <option value="femme">Femme</option>
                <option value="homme">Homme</option>
              </select>
            </div>

            {/* Orientaction */}
            <div>
              <label className="text-sm text-zinc-400">Orientaction</label>
              <select
                value={orientation}
                onChange={(e) => { setOrientation(e.target.value); setPage(1); }}
                className="w-full mt-1 px-3 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="">Toutes</option>
                <option value="heterosexuelle">Heterossexual</option>
                <option value="bisexuelle">Bissexual</option>
                <option value="lesbienne">Lésbica</option>
              </select>
            </div>
          </div>
        </div>

        {/* Profils */}
        {profiles.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">
            Aucun profil trouvé com esses critérios
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-[#1C102B] rounded-lg border border-[#2C1B3D] overflow-hidden hover:border-[#D4145A] transition"
              >
                {/* Placeholder para foto */}
                <div className="h-48 bg-gradient-to-br from-[#D4145A]/20 to-[#E86B7A]/20 flex items-center justify-center">
                  <span className="text-zinc-500">Foto</span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">{profile.username}</h3>
                      <p className="text-sm text-zinc-400">{profile.age} ans • {profile.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="text-xs bg-[#D4145A]/20 text-[#D4145A] px-2 py-1 rounded">
                      {profile.gender === 'femme' ? '♀️' : '♂️'}
                    </span>
                    <span className="text-xs bg-[#2C1B3D] text-zinc-400 px-2 py-1 rounded">
                      {profile.sexualOrientation}
                    </span>
                  </div>

                  <button
                    onClick={() => handleLike(profile.id)}
                    className={`w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      likedUsers.has(profile.id)
                        ? 'bg-[#D4145A] text-white'
                        : 'bg-[#2C1B3D] text-white hover:bg-[#3C2B4D]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedUsers.has(profile.id) ? 'fill-current' : ''}`} />
                    {likedUsers.has(profile.id) ? 'Liké' : 'Liker'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginaction */}
        {profiles.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#2C1B3D] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-white">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-[#2C1B3D] rounded-lg text-white hover:bg-[#3C2B4D]"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
