'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { Lock, Heart } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  age: number;
  gender: string;
  sexualOrientation: string;
  location: string;
}

interface UserData {
  id: string;
  username: string;
  subscriptionTier: string;
  subscriptionEnd: string | null;
}

export default function Decouvrir() {
  const [user, setUser] = useState<UserData | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  
  // Filtros
  const [location, setLocation] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(60);
  const [gender, setGender] = useState('');
  const [orientation, setOrientation] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Buscar user
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const userData = JSON.parse(Buffer.from(token, 'base64').toString());
            setUser(userData);
          } catch {
            setUser(null);
          }
        }

        // Buscar perfis
        if (user?.subscriptionTier && ['PREMIUM_3M', 'PREMIUM_12M', 'VIP_24M'].includes(user.subscriptionTier)) {
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
  }, [user, location, ageMin, ageMax, gender, orientation, page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-white">
          Carregando...
        </div>
      </div>
    );
  }

  // Todos os utilizadores autenticados podem ver perfis.
  // A regra de Premium aplica-se apenas ao envio de mensagens.
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
              <h1 className="text-3xl font-bold text-white mb-2">Descobrir Perfis</h1>
              <p className="text-zinc-400 mb-6">
                Faça login para explorar os perfis da comunidade.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block py-3 px-6 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition"
              >
                Entrar
              </Link>
              <Link
                href="/"
                className="block py-3 px-6 bg-[#2C1B3D] rounded-lg font-semibold text-white hover:bg-[#3C2B4D] transition"
              >
                Voltar à Home
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
        <h1 className="text-4xl font-bold text-white mb-8">Descobrir Perfis</h1>

        {/* Filtros */}
        <div className="bg-[#1C102B] rounded-lg p-6 border border-[#2C1B3D] mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Localização */}
            <div>
              <label className="text-sm text-zinc-400">Localização</label>
              <select
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                className="w-full mt-1 px-3 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="">Todas</option>
                <option value="Paris">Paris</option>
                <option value="Lyon">Lyon</option>
                <option value="Bordeaux">Bordeaux</option>
                <option value="Côte d'Azur">Côte d'Azur</option>
                <option value="Bruxelas">Bruxelas</option>
                <option value="Luxembourg">Luxembourg</option>
              </select>
            </div>

            {/* Idade Min */}
            <div>
              <label className="text-sm text-zinc-400">Idade Min: {ageMin}</label>
              <input
                type="range"
                min="18"
                max="99"
                value={ageMin}
                onChange={(e) => { setAgeMin(parseInt(e.target.value)); setPage(1); }}
                className="w-full mt-1"
              />
            </div>

            {/* Idade Max */}
            <div>
              <label className="text-sm text-zinc-400">Idade Max: {ageMax}</label>
              <input
                type="range"
                min="18"
                max="99"
                value={ageMax}
                onChange={(e) => { setAgeMax(parseInt(e.target.value)); setPage(1); }}
                className="w-full mt-1"
              />
            </div>

            {/* Género */}
            <div>
              <label className="text-sm text-zinc-400">Género</label>
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setPage(1); }}
                className="w-full mt-1 px-3 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="">Todos</option>
                <option value="femme">Mulher</option>
                <option value="homme">Homem</option>
              </select>
            </div>

            {/* Orientação */}
            <div>
              <label className="text-sm text-zinc-400">Orientação</label>
              <select
                value={orientation}
                onChange={(e) => { setOrientation(e.target.value); setPage(1); }}
                className="w-full mt-1 px-3 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="">Todas</option>
                <option value="heterosexuelle">Heterossexual</option>
                <option value="bisexuelle">Bissexual</option>
                <option value="lesbienne">Lésbica</option>
              </select>
            </div>
          </div>
        </div>

        {/* Perfis */}
        {profiles.length === 0 ? (
          <div className="text-center text-zinc-400 py-12">
            Nenhum perfil encontrado com esses critérios
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
                      <p className="text-sm text-zinc-400">{profile.age} anos • {profile.location}</p>
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
                    {likedUsers.has(profile.id) ? 'Curtido' : 'Curtir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {profiles.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#2C1B3D] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-white">Página {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-[#2C1B3D] rounded-lg text-white hover:bg-[#3C2B4D]"
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
