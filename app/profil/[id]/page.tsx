'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/context/auth-context';
import { fetchResilient } from '@/lib/fetch-resilient';
import { Heart, MessageSquare, ShieldCheck, MapPin, ArrowLeft } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  isCover: boolean;
}

interface ProfileDetail {
  id: string;
  username: string;
  age: number | null;
  gender: string;
  sexualOrientation: string;
  location: string;
  bio: string | null;
  interests: string | null;
  isVerified: boolean;
  isNsfw: boolean;
  createdAt: string;
}

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isPremium } = useAuth();
  const profileId = params.id as string;

  const [profil, setProfil] = useState<ProfileDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [photoActive, setPhotoActive] = useState(0);
  const [envoiLike, setEnvoiLike] = useState(false);
  const [envoiMessage, setEnvoiMessage] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const charger = async () => {
      try {
        const res = await fetchResilient(`/api/profiles/${profileId}`);
        const data = await res.json();
        if (!res.ok) {
          setErreur(data.error ?? 'Profil introuvable');
          return;
        }
        setProfil(data.profile);
        setPhotos(data.photos ?? []);
        setLiked(!!data.likedByMe);
      } catch {
        setErreur('Erreur réseau. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [profileId, user]);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setEnvoiLike(true);
    try {
      const res = await fetchResilient('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likedUserId: profileId }),
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(!!data.liked);
      } else if (data.premiumRequired) {
        router.push('/abonnements');
      } else if (res.status === 401) {
        router.push('/login');
      }
    } finally {
      setEnvoiLike(false);
    }
  };

  const handleOpenMessage = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setEnvoiMessage(true);
    try {
      const res = await fetchResilient('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: profileId }),
      });
      const data = await res.json();
      if (res.ok && data.groupId) {
        router.push(`/chat/${data.groupId}`);
        return;
      }
      if (data.premiumRequired) {
        router.push('/abonnements');
        return;
      }
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      setErreur(data.error ?? "Impossible d'ouvrir la conversation");
    } catch {
      setErreur('Erreur réseau. Réessayez.');
    } finally {
      setEnvoiMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] text-white">
          Chargement...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-3xl font-bold text-white">Profil</h1>
            <p className="text-zinc-400">Connectez-vous pour voir ce profil.</p>
            <Link
              href="/login"
              className="inline-block py-3 px-6 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (erreur || !profil) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/decouvrir" className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour à la découverte
          </Link>
          <p className="text-rose-300 text-center py-12">{erreur || 'Profil introuvable'}</p>
        </div>
      </div>
    );
  }

  const photoCourante = photos[photoActive]?.url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/decouvrir" className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour à la découverte
        </Link>

        {erreur && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/40 text-rose-300 text-sm mb-6">
            {erreur}
          </div>
        )}

        <div className="bg-[#1C102B] rounded-2xl border border-[#2C1B3D] overflow-hidden">
          {/* Photo principale */}
          <div className="h-72 bg-gradient-to-br from-[#D4145A]/20 to-[#E86B7A]/20 flex items-center justify-center overflow-hidden">
            {photoCourante ? (
              <img src={photoCourante} alt={profil.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-zinc-500">Aucune photo</span>
            )}
          </div>

          {/* Vignettes */}
          {photos.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPhotoActive(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${
                    i === photoActive ? 'border-[#D4145A]' : 'border-transparent'
                  }`}
                >
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Identité */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {profil.username}
                  {profil.isVerified && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                </h1>
                <p className="text-sm text-zinc-400 flex items-center gap-3">
                  {profil.age !== null && <span>{profil.age} ans</span>}
                  {profil.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {profil.location}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {profil.gender && (
                <span className="text-xs bg-[#D4145A]/20 text-[#D4145A] px-2 py-1 rounded">
                  {profil.gender === 'femme' ? '♀️ Femme' : profil.gender === 'homme' ? '♂️ Homme' : profil.gender}
                </span>
              )}
              {profil.sexualOrientation && (
                <span className="text-xs bg-[#2C1B3D] text-zinc-400 px-2 py-1 rounded">
                  {profil.sexualOrientation}
                </span>
              )}
              {profil.isNsfw && (
                <span className="text-xs bg-amber-950 text-amber-400 px-2 py-1 rounded">NSFW</span>
              )}
            </div>

            {/* Bio */}
            {profil.bio && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-300 mb-1">À propos</h2>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">{profil.bio}</p>
              </div>
            )}

            {/* Intérêts */}
            {profil.interests && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-300 mb-1">Centres d'intérêt</h2>
                <p className="text-sm text-zinc-400">{profil.interests}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleLike}
                disabled={envoiLike}
                className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                  liked
                    ? 'bg-[#D4145A] text-white'
                    : 'bg-[#2C1B3D] text-white hover:bg-[#3C2B4D]'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Liké' : 'Liker'}
              </button>
              <button
                onClick={handleOpenMessage}
                disabled={envoiMessage}
                className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                {envoiMessage ? '...' : 'Message'}
              </button>
            </div>
            {!isPremium && user.role !== 'admin' && (
              <p className="text-[11px] text-amber-300/80 text-center">
                Le like et l'envoi de messages nécessitent un Pass Premium.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}