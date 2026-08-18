'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/context/auth-context';
import { fetchResilient } from '@/lib/fetch-resilient';
import { Heart, MessageSquare, ShieldCheck, MapPin, ArrowLeft, Flag, X } from 'lucide-react';

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
  const [signalerOuvert, setSignalerOuvert] = useState(false);
  const [signalerRaison, setSignalerRaison] = useState('');
  const [signalerDetail, setSignalerDetail] = useState('');
  const [signalerEnvoi, setSignalerEnvoi] = useState(false);
  const [signalerMessage, setSignalerMessage] = useState<{ type: 'ok' | 'err'; texte: string } | null>(null);

  const handleSignaler = async () => {
    setSignalerMessage(null);
    if (!signalerRaison) {
      setSignalerMessage({ type: 'err', texte: 'Veuillez choisir un motif.' });
      return;
    }
    setSignalerEnvoi(true);
    try {
      const res = await fetchResilient('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedId: profileId, reason: signalerRaison, detail: signalerDetail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSignalerMessage({ type: 'ok', texte: 'Signalement envoyé. Merci, notre équipe va examiner ce profil.' });
        setSignalerRaison('');
        setSignalerDetail('');
      } else if (res.status === 409) {
        setSignalerMessage({ type: 'ok', texte: data.error ?? 'Signalement déjà enregistré.' });
      } else if (res.status === 401) {
        router.push('/login');
      } else {
        setSignalerMessage({ type: 'err', texte: data.error ?? "Échec du signalement." });
      }
    } catch {
      setSignalerMessage({ type: 'err', texte: 'Erreur réseau. Réessayez.' });
    } finally {
      setSignalerEnvoi(false);
    }
  };

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
                  {profil.gender === 'femme' ? '♀️ Femme' : profil.gender === 'homme' ? '♂️ Homme' : profil.gender === 'couple' ? '💞 Couple' : profil.gender}
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
                Le like et l&apos;envoi de messages nécessitent un Pass Premium.
              </p>
            )}

            {/* Signaler ce membre */}
            <div className="pt-2 border-t border-[#2C1B3D]">
              <button
                onClick={() => {
                  setSignalerOuvert(true);
                  setSignalerMessage(null);
                }}
                className="text-[11px] text-zinc-500 hover:text-rose-400 inline-flex items-center gap-1.5 transition-colors"
              >
                <Flag className="w-3 h-3" />
                Signaler ce membre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale de signalement */}
      {signalerOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#1C102B] border border-[#3D2654] rounded-2xl shadow-2xl p-6 text-white space-y-4">
            <button
              onClick={() => setSignalerOuvert(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#2C1B3D] text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <Flag className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Signaler {profil.username}</h3>
                <p className="text-xs text-zinc-400">
                  Notre équipe examinera ce signalement. Les signalements abusifs sont sanctionnés.
                </p>
              </div>
            </div>

            {signalerMessage && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  signalerMessage.type === 'ok'
                    ? 'bg-emerald-950/70 border border-emerald-700/40 text-emerald-200'
                    : 'bg-rose-950/70 border border-rose-800/40 text-rose-200'
                }`}
              >
                {signalerMessage.texte}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 block mb-1">Motif du signalement</label>
                <select
                  value={signalerRaison}
                  onChange={(e) => setSignalerRaison(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-sm text-white focus:outline-none focus:border-[#D4145A]"
                >
                  <option value="">Sélectionnez un motif…</option>
                  <option value="Faux profil / photos volées">Faux profil / photos volées</option>
                  <option value="Harcèlement">Harcèlement</option>
                  <option value="Contenu inapproprié">Contenu inapproprié</option>
                  <option value="Spam / arnaque">Spam / arnaque</option>
                  <option value="Mineur / âge suspect">Mineur / âge suspect</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-300 block mb-1">Détails (optionnel)</label>
                <textarea
                  value={signalerDetail}
                  onChange={(e) => setSignalerDetail(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Précisez ce qui s&apos;est passé…"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4145A] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setSignalerOuvert(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2C1B3D] text-zinc-300 text-xs font-bold hover:bg-[#3C2B4D]"
              >
                Annuler
              </button>
              <button
                onClick={handleSignaler}
                disabled={signalerEnvoi}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {signalerEnvoi ? 'Envoi…' : 'Envoyer le signalement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}