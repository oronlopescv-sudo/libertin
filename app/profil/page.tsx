'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PhotoVerificationModal } from '@/components/photo-verification-modal';
import { useAuth } from '@/context/auth-context';
import { Store } from '@/lib/store';
import { getPlanDetails } from '@/lib/stripe';
import { CITIES, COUNTRIES } from '@/lib/geo';
import {
  User as UserIcon,
  ShieldCheck,
  Camera,
  Crown,
  MapPin,
  Save,
  Plus,
  Trash2,
  Lock,
  Upload,
  Check,
  UserX,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const { user, refreshUser, isPremium } = useAuth();
  const [verifModalOpen, setVerifModalOpen] = useState(false);

  // Edit fields
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || 'Paris');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#12091A] text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="p-8 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] text-center space-y-4 max-w-sm">
            <UserIcon className="w-10 h-10 text-[#D4145A] mx-auto" />
            <h2 className="text-lg font-bold">Veuillez vous connecter</h2>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#D4145A] text-white text-xs font-bold inline-block"
            >
              Se Connecter
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cityCoords = CITIES[location] || { lat: 48.8566, lng: 2.3522 };

    Store.updateUser({
      id: user.id,
      bio,
      location,
      lat: cityCoords.lat,
      lng: cityCoords.lng,
    });

    refreshUser();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddPhoto = (urlToAdd?: string) => {
    const url = urlToAdd || newPhotoUrl;
    if (!url || !url.trim()) return;

    const newPhoto = {
      id: `photo-${Date.now()}`,
      userId: user.id,
      url: url,
      isCover: user.photos.length === 0,
      order: user.photos.length,
      uploadedAt: new Date().toISOString(),
    };

    Store.updateUser({
      id: user.id,
      photos: [...user.photos, newPhoto],
    });

    setNewPhotoUrl('');
    refreshUser();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          handleAddPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = user.photos.filter((p) => p.id !== photoId);
    // If deleted photo was cover and there are other photos, set first as cover
    if (updatedPhotos.length > 0 && !updatedPhotos.some((p) => p.isCover)) {
      updatedPhotos[0].isCover = true;
    }
    Store.updateUser({
      id: user.id,
      photos: updatedPhotos,
    });
    refreshUser();
  };

  const handleSetCoverPhoto = (photoId: string) => {
    const updatedPhotos = user.photos.map((p) => ({
      ...p,
      isCover: p.id === photoId,
    }));
    Store.updateUser({
      id: user.id,
      photos: updatedPhotos,
    });
    refreshUser();
  };

  const handleUnblockUser = (targetId: string) => {
    Store.unblockUser(user.id, targetId);
    refreshUser();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Banner Header */}
        <div className="p-6 rounded-3xl bg-[#1C102B] border border-[#2C1B3D] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src={
                  user.photos[0]?.url ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                }
                alt={user.username}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4145A] shadow-lg"
              />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <span>{user.username}</span>
                {user.isVerified ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold">
                    Profil Vérifié
                  </span>
                ) : (
                  <button
                    onClick={() => setVerifModalOpen(true)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40 font-semibold hover:bg-amber-900"
                  >
                    Demander la Vérification
                  </button>
                )}
              </h1>
              <div className="text-xs text-zinc-400 capitalize">
                {user.gender} • {user.age} ans • {user.location}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-[11px] text-zinc-400">Statut d&apos;Abonnement</div>
              <div className="text-sm font-bold text-[#E86B7A]">
                {getPlanDetails(user.subscriptionTier).title}
              </div>
            </div>

            {!isPremium && (
              <Link
                href="/abonnements"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Passer Premium</span>
              </Link>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950 text-emerald-300 text-xs text-center border border-emerald-800/40">
            Profil mis à jour avec succès !
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-[#1C102B] border border-[#2C1B3D] space-y-6 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2C1B3D] pb-3">
            Modifier mes Informations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Ville de résidence</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
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

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Adresse E-mail</label>
              <input
                type="text"
                readOnly
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-medium mb-1">Ma Présentation / Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#D4145A] text-white text-xs font-bold hover:bg-[#B50E4A] shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </form>

        {/* Photo Gallery Manager */}
        <div className="p-6 rounded-3xl bg-[#1C102B] border border-[#2C1B3D] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2C1B3D] pb-3 flex items-center justify-between">
            <span>Galerie Photos ({user.photos.length})</span>
            <span className="text-[10px] text-zinc-400 font-normal">Gérez vos clichés et votre photo principale</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {user.photos.map((photo) => (
              <div key={photo.id} className="relative rounded-2xl overflow-hidden aspect-square border border-[#3D2654] group">
                <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                
                {photo.isCover ? (
                  <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded bg-[#D4145A] text-white font-bold shadow">
                    Couverture
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetCoverPhoto(photo.id)}
                    className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded bg-black/60 hover:bg-[#D4145A] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Définir couverture
                  </button>
                )}

                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  title="Supprimer la photo"
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-900 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-3 border-t border-[#2C1B3D]">
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#12091A] border border-dashed border-[#3D2654] hover:border-[#D4145A] cursor-pointer text-zinc-300 font-medium transition-colors">
                <Upload className="w-4 h-4 text-[#E86B7A]" />
                <span>Téléverser une foto depuis votre appareil</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  placeholder="ou coller le lien d'une image (https://...)"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
                <button
                  onClick={() => handleAddPhoto()}
                  className="px-4 py-2.5 rounded-xl bg-[#2C1B3D] text-white font-bold hover:bg-[#3D2654] flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confidentiality & Blocked Users Section */}
        <div className="p-6 rounded-3xl bg-[#1C102B] border border-[#2C1B3D] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2C1B3D] pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-400" />
              <span>Confidentialité & Membres Bloqués ({(user.blockedUserIds || []).length})</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">
              Les membres bloqués ne peuvent plus interagir avec vous ni voir vos messages
            </span>
          </h3>

          {(user.blockedUserIds || []).length === 0 ? (
            <div className="p-4 rounded-xl bg-[#12091A] border border-[#2C1B3D] text-center text-zinc-400">
              <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-1 opacity-80" />
              <p className="font-medium text-zinc-300">Aucun membre bloqué</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Vous pouvez bloquer un profil à tout moment depuis sa fiche pour protéger votre tranquillité.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(user.blockedUserIds || []).map((blockedId) => {
                const blockedUser = Store.getUserById(blockedId);
                const avatar =
                  blockedUser?.photos?.[0]?.url ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={blockedId}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#12091A] border border-[#2C1B3D]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={avatar}
                        alt={blockedUser?.username || 'Membre'}
                        className="w-10 h-10 rounded-full object-cover border border-red-500/40 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold text-white text-xs truncate">
                          {blockedUser?.username || 'Membre restreint'}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {blockedUser?.location || 'Localisation privée'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnblockUser(blockedId)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 text-[11px] font-semibold shrink-0"
                    >
                      Débloquer
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Photo Verification Modal */}
        <PhotoVerificationModal
          isOpen={verifModalOpen}
          onClose={() => setVerifModalOpen(false)}
        />
      </main>

      <Footer />
    </div>
  );
}
