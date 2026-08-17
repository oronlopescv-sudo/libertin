'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import { Store } from '@/lib/store';
import { useAuth } from '@/context/auth-context';
import { getDistance, resolveLocationCoords, CITIES } from '@/lib/geo';
import {
  ShieldCheck,
  MapPin,
  Lock,
  Heart,
  MessageSquare,
  Eye,
  Crown,
  Flame,
  X,
  UserX,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface ProfileCardProps {
  profile: User;
  currentUser: User | null;
  isPremium: boolean;
  onOpenMessageModal?: (profile: User) => void;
  onBlockStatusChange?: () => void;
}

export function ProfileCard({
  profile,
  currentUser,
  isPremium,
  onOpenMessageModal,
  onBlockStatusChange,
}: ProfileCardProps) {
  const { refreshUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const isUserBlocked = currentUser ? Store.isBlocked(currentUser.id, profile.id) : false;

  const handleToggleBlock = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) return;

    if (isUserBlocked) {
      Store.unblockUser(currentUser.id, profile.id);
    } else {
      Store.blockUser(currentUser.id, profile.id);
    }
    refreshUser();
    if (onBlockStatusChange) onBlockStatusChange();
  };

  // Compute distance in km from current user location
  const currentCoords = currentUser
    ? resolveLocationCoords(currentUser.location, currentUser.lat, currentUser.lng)
    : { lat: 48.8566, lng: 2.3522 };

  const targetCoords = resolveLocationCoords(profile.location, profile.lat, profile.lng);

  const distanceKm = getDistance(
    currentCoords.lat,
    currentCoords.lng,
    targetCoords.lat,
    targetCoords.lng
  );

  const primaryPhoto =
    (profile.photos ?? []).find((p) => p.isCover)?.url ||
    profile.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80';

  const genderLabels = {
    couple: 'Couple Libertin',
    femme: 'Femme Solo',
    homme: 'Homme Solo',
  };

  const genderColors = {
    couple: 'bg-[#D4145A] text-white',
    femme: 'bg-purple-600 text-white',
    homme: 'bg-indigo-600 text-white',
  };

  return (
    <>
      <div className="group relative rounded-2xl bg-[#1C102B] border border-[#2C1B3D] hover:border-[#D4145A]/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[#D4145A]/15 flex flex-col">
        {/* Photo Container */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#2C1B3D]">
          <img
            src={primaryPhoto}
            alt={profile.username}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !isPremium ? 'blur-md filter scale-105 opacity-80' : ''
            }`}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C102B] via-transparent to-black/30" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider ${
                genderColors[profile.gender]
              }`}
            >
              {genderLabels[profile.gender]}
            </span>

            {profile.isVerified && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vérifié</span>
              </span>
            )}
          </div>

          {/* Free User Blur Gate Overlay */}
          {!isPremium && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-[#D4145A]/80 flex items-center justify-center mb-2 shadow-lg animate-pulse-subtle">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                Photo floutée
              </p>
              <p className="text-[11px] text-zinc-300 mb-3 max-w-[200px]">
                Réservé aux membres Premium
              </p>
              <Link
                href="/abonnements"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold hover:opacity-90 shadow-lg shadow-[#D4145A]/30 flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Débloquer</span>
              </Link>
            </div>
          )}

          {/* Bottom Photo Info */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg font-bold truncate tracking-tight">
                {profile.username}
              </h3>
              <span className="text-sm font-medium text-zinc-300">
                {profile.age} ans
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-300 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E86B7A]" />
                <span>{CITIES[profile.location]?.flag || '📍'} {profile.location}</span>
              </span>
              {distanceKm !== Infinity && (
                <span className="text-zinc-400">
                  • à {distanceKm} km
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed italic">
            &quot;{profile.bio || 'Couple passionné à la recherche de belles rencontres respectueuses.'}&quot;
          </p>

          {/* Interests Pills */}
          <div className="flex flex-wrap gap-1.5">
            {(profile.interests ?? []).slice(0, 3).map((interest, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#2C1B3D] text-zinc-300 border border-[#3D2654]"
              >
                {interest}
              </span>
            ))}
            {(profile.interests ?? []).length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#2C1B3D] text-zinc-400">
                +{(profile.interests ?? []).length - 3}
              </span>
            )}
          </div>

          {/* Actions Bar */}
          <div className="pt-2 border-t border-[#2C1B3D] flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  liked
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-[#2C1B3D] text-zinc-400 hover:text-white'
                }`}
                title={liked ? "Coup de cœur" : "J'aime"}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-400' : ''}`} />
                <span className="hidden sm:inline">{liked ? 'Coup de cœur' : 'J\'aime'}</span>
              </button>

              {currentUser && currentUser.id !== profile.id && (
                <button
                  onClick={handleToggleBlock}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isUserBlocked
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  }`}
                  title={isUserBlocked ? 'Débloquer ce membre' : 'Bloquer ce membre'}
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isUserBlocked ? 'Débloquer' : 'Bloquer'}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setDetailModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#D4145A]/20 text-[#E86B7A] hover:bg-[#D4145A] hover:text-white text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Voir le profil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Profile View Modal */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1C102B] border border-[#3D2654] rounded-2xl shadow-2xl p-6 text-white space-y-6">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#2C1B3D] text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#D4145A]">
                <img
                  src={primaryPhoto}
                  alt={profile.username}
                  className={`w-full h-full object-cover ${!isPremium ? 'blur-md' : ''}`}
                />
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold">{profile.username}</h2>
                  {profile.isVerified && (
                    <span title="Profil Vérifié">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </span>
                  )}
                </div>

                <div className="text-sm text-zinc-300">
                  <span className="capitalize font-semibold text-[#E86B7A]">
                    {genderLabels[profile.gender]}
                  </span>{' '}
                  • {profile.age} ans • {profile.location} ({distanceKm} km)
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-md">
                  <Flame className="w-3.5 h-3.5 text-[#E86B7A]" />
                  <span>Compatibilité Libertine: 94%</span>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">
                Album Photos ({(profile.photos ?? []).length})
              </h4>
              {!isPremium ? (
                <div className="p-4 rounded-xl bg-[#2C1B3D]/80 border border-[#3D2654] text-center space-y-2">
                  <Lock className="w-6 h-6 text-[#D4145A] mx-auto" />
                  <p className="text-sm font-semibold text-white">
                    Les photos de cet album sont réservées aux membres Premium
                  </p>
                  <Link
                    href="/abonnements"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4145A] text-white text-xs font-bold shadow-md"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Passer en Premium (à partir de 4,58€/mois)</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(profile.photos ?? []).map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt="Photo"
                      className="w-full h-32 object-cover rounded-xl border border-[#3D2654]"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bio & Details */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                À propos de nous
              </h4>
              <p className="text-sm text-zinc-200 leading-relaxed bg-[#2C1B3D]/50 p-4 rounded-xl border border-[#3D2654]">
                {profile.bio || 'Aucune biographie rédigée.'}
              </p>
            </div>

            {/* Interests */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">
                Envies & Centres d&apos;intérêt
              </h4>
              <div className="flex flex-wrap gap-2">
                {(profile.interests ?? []).map((interest, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg bg-[#2C1B3D] text-[#E86B7A] border border-[#3D2654]"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#2C1B3D] flex flex-wrap items-center justify-between gap-3">
              <div>
                {currentUser && currentUser.id !== profile.id && (
                  <button
                    onClick={handleToggleBlock}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      isUserBlocked
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                        : 'bg-red-950/60 text-red-300 border border-red-500/40 hover:bg-red-900/80'
                    }`}
                  >
                    <UserX className="w-4 h-4" />
                    <span>{isUserBlocked ? 'Débloquer ce membre' : 'Bloquer ce membre'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#2C1B3D] text-zinc-300 text-xs font-medium hover:text-white"
                >
                  Fermer
                </button>

                {!isUserBlocked && (
                  <button
                    onClick={() => {
                      setDetailModalOpen(false);
                      if (onOpenMessageModal) onOpenMessageModal(profile);
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold shadow-lg flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Envoyer un message privé</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
