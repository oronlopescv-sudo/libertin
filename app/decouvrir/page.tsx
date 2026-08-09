'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProfileCard } from '@/components/profile-card';
import { User, GenderType } from '@/lib/types';
import { getDistance, resolveLocationCoords, CITIES, COUNTRIES } from '@/lib/geo';
import {
  Filter,
  ShieldCheck,
  MapPin,
  Search,
  Lock,
  Crown,
  LayoutGrid,
  Layers,
  Heart,
  X,
  MessageSquare,
  Globe,
  UserX,
} from 'lucide-react';
import Link from 'next/link';

export default function DecouvrirPage() {
  // const { ... } = useAuth();
  const user = null;
  const usersList = [];
  const isPremium = false;

  // Filters state
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [showBlockedOnly, setShowBlockedOnly] = useState<boolean>(false);
  const [searchCity, setSearchCity] = useState<string>('Paris');
  const [activeViewMode, setActiveViewMode] = useState<'grid' | 'swipe'>('grid');

  // Direct Message Modal Target
  const [messageTargetUser, setMessageTargetUser] = useState<User | null>(null);

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    const blockedIds = user?.blockedUserIds || [];

    return usersList.filter((p) => {
      // Exclude current logged in user from discovery
      if (user && p.id === user.id) return false;

      // Handle blocked filter mode
      if (showBlockedOnly) {
        return blockedIds.includes(p.id);
      } else {
        // Exclude blocked users from normal discovery
        if (blockedIds.includes(p.id)) return false;
      }

      // Gender filter
      if (selectedGender !== 'all' && p.gender !== selectedGender) {
        return false;
      }

      // Verified filter
      if (verifiedOnly && !p.isVerified) {
        return false;
      }

      // Country filter
      if (selectedCountry !== 'ALL') {
        const countryObj = COUNTRIES.find((c) => c.code === selectedCountry);
        const cityConfig = CITIES[p.location];
        if (countryObj && cityConfig && cityConfig.country !== countryObj.name) {
          return false;
        }
      }

      // Distance filter using GPS or city fallback
      const currentCoords = resolveLocationCoords(
        searchCity,
        user?.lat,
        user?.lng
      );
      const targetCoords = resolveLocationCoords(p.location, p.lat, p.lng);
      const dist = getDistance(
        currentCoords.lat,
        currentCoords.lng,
        targetCoords.lat,
        targetCoords.lng
      );

      if (maxDistance < 100 && dist > maxDistance) {
        return false;
      }

      return true;
    });
  }, [usersList, user, selectedGender, selectedCountry, verifiedOnly, showBlockedOnly, searchCity, maxDistance]);

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Intro */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1C102B] border border-[#2C1B3D] p-6 rounded-3xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Découvrir les Membres
              </h1>
              {isPremium ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold flex items-center gap-1 shadow-md">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Accès Débloqué</span>
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aperçu Gratuit</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Trouvez des couples et célibataires correspondant à vos critères géographiques et libertins
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-[#2C1B3D] p-1.5 rounded-2xl border border-[#3D2654]">
            <button
              onClick={() => setActiveViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeViewMode === 'grid'
                  ? 'bg-[#D4145A] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grille</span>
            </button>
            <button
              onClick={() => setActiveViewMode('swipe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeViewMode === 'swipe'
                  ? 'bg-[#D4145A] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Mode Swipe</span>
            </button>
          </div>
        </div>

        {/* Free Banner Upgrade Prompt if not Premium */}
        {!isPremium && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#D4145A]/20 via-[#2C1B3D] to-[#1C102B] border border-[#D4145A]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4145A] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Débloquez tous les profils & photos de votre région
                </h3>
                <p className="text-xs text-zinc-300">
                  Les membres Premium bénéficient du défloutage automatique et des tchats directs illimités.
                </p>
              </div>
            </div>

            <Link
              href="/abonnements"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-[#D4145A]/30 shrink-0"
            >
              Découvrir les offres dès 2.08€/mois
            </Link>
          </div>
        )}

        {/* Filters Bar */}
        <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2C1B3D] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Filter className="w-4 h-4 text-[#E86B7A]" />
              <span>Filtres de Recherche Francophones</span>
            </div>
            <div className="flex items-center gap-3">
              {(user?.blockedUserIds?.length || 0) > 0 && (
                <button
                  onClick={() => setShowBlockedOnly(!showBlockedOnly)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                    showBlockedOnly
                      ? 'bg-red-500/20 text-red-300 border-red-500/50'
                      : 'bg-[#2C1B3D] text-zinc-400 border-[#3D2654] hover:text-white'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5 text-red-400" />
                  <span>
                    {showBlockedOnly
                      ? 'Voir tous les membres'
                      : `Membres Bloqués (${user?.blockedUserIds?.length || 0})`}
                  </span>
                </button>
              )}
              <div className="text-[11px] text-zinc-400">
                {filteredProfiles.length} membre{filteredProfiles.length > 1 ? 's' : ''} trouvé{filteredProfiles.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Country Quick Select Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium mr-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#E86B7A]" /> Pays :
            </span>
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setSelectedCountry(c.code);
                  if (c.code !== 'ALL') {
                    const firstCity = Object.values(CITIES).find((ci) => ci.country === c.name);
                    if (firstCity) setSearchCity(firstCity.name);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCountry === c.code
                    ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white shadow-md'
                    : 'bg-[#12091A] text-zinc-400 border border-[#3D2654] hover:text-white hover:border-[#D4145A]/50'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
            {/* Gender Filter */}
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Type de membre</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
              >
                <option value="all">Tous les profils</option>
                <option value="couple">Couples Libertins uniquement</option>
                <option value="femme">Femmes Solos uniquement</option>
                <option value="homme">Hommes Solos uniquement</option>
              </select>
            </div>

            {/* City Base */}
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Autour de quelle ville ?</label>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
              >
                {COUNTRIES.filter((c) => c.code !== 'ALL').map((c) => (
                  <optgroup key={c.code} label={`${c.flag} ${c.name}`}>
                    {Object.values(CITIES)
                      .filter((ci) => ci.country === c.name)
                      .map((ci) => (
                        <option key={ci.name} value={ci.name}>
                          {ci.flag} {ci.name} ({ci.country})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Radius Distance Filter */}
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">
                Rayon de recherche : <strong className="text-white">{maxDistance >= 100 ? 'Partout en Europe' : `${maxDistance} km`}</strong>
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={10}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-[#D4145A] cursor-pointer mt-2"
              />
            </div>

            {/* Verified Only Toggle */}
            <div className="flex items-end">
              <label className="w-full flex items-center justify-between p-2 rounded-xl bg-[#12091A] border border-[#3D2654] cursor-pointer hover:border-[#D4145A]/50 transition-colors">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Profils Vérifiés</span>
                </span>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-[#3D2654] bg-[#1C102B] text-[#D4145A] focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Profiles Grid View */}
        {activeViewMode === 'grid' ? (
          <div>
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-4">
              <span>{filteredProfiles.length} profils trouvés</span>
              <span>Triés par disponibilité récente</span>
            </div>

            {filteredProfiles.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#1C102B] border border-[#2C1B3D] space-y-3">
                <Search className="w-10 h-10 text-zinc-500 mx-auto" />
                <h3 className="text-base font-bold text-white">Aucun profil ne correspond à ces filtres</h3>
                <p className="text-xs text-zinc-400">Élargissez votre rayon de recherche ou désactivez certains filtres.</p>
                <button
                  onClick={() => {
                    setSelectedGender('all');
                    setMaxDistance(100);
                    setVerifiedOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#D4145A] text-white text-xs font-bold"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    currentUser={user}
                    isPremium={isPremium}
                    onOpenMessageModal={(p) => setMessageTargetUser(p)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* SWIPE TINDER-STYLE VIEW */
          <div className="max-w-md mx-auto py-6 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Mode Découverte Tactile</h2>
              <p className="text-xs text-zinc-400">Passez en revue les profils coup de cœur de votre région</p>
            </div>

            {filteredProfiles.length > 0 ? (
              <div className="space-y-4">
                <ProfileCard
                  profile={filteredProfiles[0]}
                  currentUser={user}
                  isPremium={isPremium}
                  onOpenMessageModal={(p) => setMessageTargetUser(p)}
                />

                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      alert('Profil passé !');
                    }}
                    className="p-4 rounded-full bg-[#1C102B] border border-[#3D2654] text-zinc-400 hover:text-rose-400 hover:border-rose-500/50 transition-all shadow-xl"
                    title="Passer"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => {
                      alert('Coup de cœur envoyé à ' + filteredProfiles[0].username + ' !');
                    }}
                    className="p-5 rounded-full bg-gradient-to-tr from-[#D4145A] to-[#E86B7A] text-white shadow-xl shadow-[#D4145A]/30 hover:scale-105 transition-all"
                    title="Coup de cœur"
                  >
                    <Heart className="w-7 h-7 fill-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#1C102B] rounded-2xl border border-[#2C1B3D] text-xs text-zinc-400">
                Aucun profil à faire défiler avec ces filtres.
              </div>
            )}
          </div>
        )}

        {/* Direct Message Target Modal */}
        {messageTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-[#1C102B] border border-[#3D2654] rounded-2xl p-6 text-white space-y-4">
              <button
                onClick={() => setMessageTargetUser(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#2C1B3D] text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <img
                  src={messageTargetUser.photos[0]?.url}
                  alt={messageTargetUser.username}
                  className="w-12 h-12 rounded-full object-cover border border-[#D4145A]"
                />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1">
                    Message à {messageTargetUser.username}
                    {messageTargetUser.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  </h3>
                  <div className="text-xs text-zinc-400">
                    {messageTargetUser.location}
                  </div>
                </div>
              </div>

              {!isPremium ? (
                <div className="p-4 rounded-xl bg-[#2C1B3D] border border-[#3D2654] text-center space-y-3">
                  <Lock className="w-6 h-6 text-[#D4145A] mx-auto" />
                  <p className="text-xs text-zinc-200">
                    L&apos;envoi de messages privés directs est une fonctionnalité réservée aux membres Premium.
                  </p>
                  <Link
                    href="/abonnements"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold shadow-md"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Débloquer les messages (dès 2.08€/mois)</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    placeholder="Écrivez votre message respectueux et courtois..."
                    className="w-full p-3 rounded-xl bg-[#12091A] border border-[#3D2654] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                  />
                  <button
                    onClick={() => {
                      alert(`Message transmis avec succès à ${messageTargetUser.username} !`);
                      setMessageTargetUser(null);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Envoyer le message discret</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
