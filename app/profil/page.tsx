'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { LogOut, User, Mail, Camera, Star, Trash2, Loader2, Save, MapPin, X, Info } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { CITIES, COUNTRIES } from '@/lib/geo';

type Photo = {
  id: string;
  url: string;
  is_cover: boolean;
  display_order: number;
  uploaded_at: string;
};

/**
 * Page de profil.
 *
 * Lit l'utilisateur connecté depuis le contexte d'authentification
 * (useAuth), alimenté par Supabase Auth — la source unique de vérité.
 * L'ancienne version utilisait `localStorage.getItem('user')` : comme la
 * connexion Supabase Auth n'écrit jamais dans localStorage, la page ne
 * trouvait jamais l'utilisateur et renvoyait systématiquement vers /login,
 * même juste après une connexion réussie.
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [erreur, setErreur] = useState('');

  // Champs éditables du profil (bio, intérêts, localisation, genre,
  // orientation, date de naissance, NSFW). Chargés depuis /api/users/profile.
  const [profilForm, setProfilForm] = useState({
    bio: '',
    interests: [] as string[],
    location: '',
    gender: '',
    sexualOrientation: '',
    dateOfBirth: '',
    isNsfw: false,
  });
  const [profilLoading, setProfilLoading] = useState(true);
  const [profilSaving, setProfilSaving] = useState(false);
  const [profilMessage, setProfilMessage] = useState<{ type: 'ok' | 'err'; texte: string } | null>(null);
  const [interestInput, setInterestInput] = useState('');

  const chargerPhotos = useCallback(async () => {
    try {
      const res = await fetchResilient('/api/photos');
      const data = await res.json();
      if (res.ok) setPhotos(data.photos ?? []);
    } catch {
      // Silencieux : l'absence de photos n'est pas une erreur bloquante.
    } finally {
      setPhotosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) chargerPhotos();
  }, [user, chargerPhotos]);

  const chargerProfil = useCallback(async () => {
    try {
      const res = await fetchResilient('/api/users/profile');
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfilForm({
          bio: data.profile.bio ?? '',
          interests: Array.isArray(data.profile.interests) ? data.profile.interests : [],
          location: data.profile.location ?? '',
          gender: data.profile.gender ?? '',
          sexualOrientation: data.profile.sexualOrientation ?? '',
          dateOfBirth: data.profile.dateOfBirth ?? '',
          isNsfw: !!data.profile.isNsfw,
        });
      }
    } catch {
      // Silencieux : le formulaire reste vide, ce n'est pas bloquant.
    } finally {
      setProfilLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) chargerProfil();
  }, [user, chargerProfil]);

  const ajouterInteret = () => {
    const val = interestInput.trim().slice(0, 40);
    if (!val) return;
    if (profilForm.interests.includes(val)) {
      setInterestInput('');
      return;
    }
    if (profilForm.interests.length >= 20) return;
    setProfilForm((p) => ({ ...p, interests: [...p.interests, val] }));
    setInterestInput('');
  };

  const retirerInteret = (tag: string) => {
    setProfilForm((p) => ({ ...p, interests: p.interests.filter((i) => i !== tag) }));
  };

  const handleProfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfilMessage(null);
    setProfilSaving(true);
    try {
      const res = await fetchResilient('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilForm),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setProfilMessage({ type: 'ok', texte: 'Profil mis à jour.' });
        refreshUser();
      } else if (res.status === 401) {
        router.replace('/login');
      } else {
        setProfilMessage({ type: 'err', texte: data.error ?? 'Échec de la mise à jour.' });
      }
    } catch {
      setProfilMessage({ type: 'err', texte: 'Erreur réseau. Réessayez.' });
    } finally {
      setProfilSaving(false);
    }
  };

  // Pas de session valide : on renvoie vers la connexion. On n'agit que
  // quand le contexte a fini de charger pour éviter un clignotement.
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  const handleLogout = () => {
    // logout() appelle signOutWithSupabase() : invalide la session côté
    // Supabase Auth et supprime les cookies. L'ancien appel à
    // /api/auth/logout ne nettoyait que le cookie mort `auth_token` et
    // laissait la session Supabase active.
    logout();
    router.replace('/');
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de re-choisir le même fichier ensuite
    if (!file) return;

    setErreur('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetchResilient('/api/photos/upload', { method: 'POST', body: formData });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Le serveur n'a pas renvoyé de JSON valide (page d'erreur HTML du
        // proxy Hostinger, 502/504, etc.) — plus utile à dire que "erreur
        // réseau" générique, qui laisse penser à tort à un problème de
        // connexion du côté de la personne.
        setErreur(`Le serveur n'a pas répondu correctement (code ${res.status}). Réessayez dans un instant.`);
        return;
      }

      if (!res.ok) {
        if (data.premiumRequired) {
          router.push('/abonnements');
          return;
        }
        // `message` porte la cause technique concrète quand le serveur en
        // connaît une (clé manquante, bucket absent…) — plus utile que le
        // libellé générique seul.
        setErreur(data.message ? `${data.error} — ${data.message}` : (data.error ?? "Échec de l'envoi de la photo"));
        return;
      }

      await chargerPhotos();
    } catch (err) {
      console.error('[upload photo]', err);
      const msg = err instanceof Error ? err.message : String(err);
      setErreur(`Erreur réseau (${msg}). Vérifiez votre connexion et réessayez.`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    setErreur('');
    setDeletingId(photoId);
    try {
      const res = await fetchResilient(`/api/photos?id=${photoId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error ?? 'Erreur lors de la suppression');
        return;
      }
      await chargerPhotos();
    } catch (err) {
      console.error('[delete photo]', err);
      const msg = err instanceof Error ? err.message : String(err);
      setErreur(`Erreur réseau (${msg}). Vérifiez votre connexion et réessayez.`);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Chargement du profil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#1C102B] border border-[#2C1B3D] rounded-2xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white">Mon profil</h1>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-[#D4145A]" />
              <div>
                <p className="text-zinc-400 text-sm">Nom d'utilisateur</p>
                <p className="text-white font-semibold">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-[#D4145A]" />
              <div>
                <p className="text-zinc-400 text-sm">Email</p>
                <p className="text-white font-semibold">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Modifier mon profil — bio, centres d'intérêt, localisation,
              genre, orientation, date de naissance, contenu NSFW. */}
          <form onSubmit={handleProfilSubmit} className="pt-6 border-t border-[#2C1B3D] space-y-5">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Save className="w-4 h-4 text-[#D4145A]" />
              Modifier mon profil
            </h2>

            {profilLoading ? (
              <p className="text-zinc-500 text-sm">Chargement…</p>
            ) : (
              <>
                {/* Bio */}
                <div>
                <label className="text-sm text-zinc-400 flex items-center gap-1 mb-1">
                  <Info className="w-3.5 h-3.5" /> À propos
                </label>
                <textarea
                  value={profilForm.bio}
                  onChange={(e) => setProfilForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  maxLength={1000}
                  placeholder="Présentez-vous en quelques mots…"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#12091A] border border-[#3D2654] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4145A] resize-none"
                />
                <p className="text-[11px] text-zinc-600 mt-1">{profilForm.bio.length}/1000</p>
                </div>

                {/* Centres d'intérêt */}
                <div>
                <label className="text-sm text-zinc-400 block mb-1">Centres d'intérêt</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        ajouterInteret();
                      }
                    }}
                    maxLength={40}
                    placeholder="Ex : voyages, photo…"
                    className="flex-1 px-3 py-2 rounded-lg bg-[#12091A] border border-[#3D2654] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4145A]"
                  />
                  <button
                    type="button"
                    onClick={ajouterInteret}
                    className="px-3 py-2 rounded-lg bg-[#2C1B3D] text-white text-sm hover:bg-[#3C2B4D]"
                  >
                    Ajouter
                  </button>
                </div>
                {profilForm.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profilForm.interests.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs bg-[#D4145A]/15 text-[#E86B7A] px-2 py-1 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => retirerInteret(tag)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                </div>

                {/* Localisation */}
                <div>
                <label className="text-sm text-zinc-400 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Localisation
                </label>
                <select
                  value={profilForm.location}
                  onChange={(e) => setProfilForm((p) => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#12091A] border border-[#3D2654] text-sm text-white focus:outline-none focus:border-[#D4145A]"
                >
                  <option value="">— Aucune —</option>
                  {COUNTRIES.filter((c) => c.code !== 'ALL').map((c) => (
                    <optgroup key={c.code} label={`${c.flag} ${c.name}`}>
                      {Object.values(CITIES)
                        .filter((ci) => ci.country === c.name)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((ci) => (
                          <option key={ci.name} value={ci.name}>
                            {ci.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                </div>

                {/* Genre + Orientation */}
                <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Genre</label>
                  <select
                    value={profilForm.gender}
                    onChange={(e) => setProfilForm((p) => ({ ...p, gender: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#12091A] border border-[#3D2654] text-sm text-white focus:outline-none focus:border-[#D4145A]"
                  >
                    <option value="">—</option>
                    <option value="femme">Femme</option>
                    <option value="homme">Homme</option>
                    <option value="couple">Couple</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Orientation</label>
                  <select
                    value={profilForm.sexualOrientation}
                    onChange={(e) => setProfilForm((p) => ({ ...p, sexualOrientation: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#12091A] border border-[#3D2654] text-sm text-white focus:outline-none focus:border-[#D4145A]"
                  >
                    <option value="">—</option>
                    <option value="hetero">Hétérosexuel(le)</option>
                    <option value="homo">Homosexuel(le)</option>
                    <option value="bi">Bisexuel(le)</option>
                    <option value="libertin">Libertin(e)</option>
                  </select>
                </div>
                </div>

                {/* Date de naissance + NSFW */}
                <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={profilForm.dateOfBirth}
                    onChange={(e) => setProfilForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#12091A] border border-[#3D2654] text-sm text-white focus:outline-none focus:border-[#D4145A]"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-300 self-end pb-2.5">
                  <input
                    type="checkbox"
                    checked={profilForm.isNsfw}
                    onChange={(e) => setProfilForm((p) => ({ ...p, isNsfw: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Contenu NSFW
                </label>
                </div>

                {profilMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      profilMessage.type === 'ok'
                        ? 'bg-emerald-950/70 border border-emerald-700/40 text-emerald-200'
                        : 'bg-rose-950/70 border border-rose-800/40 text-rose-200'
                    }`}
                  >
                    {profilMessage.texte}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profilSaving}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {profilSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {profilSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </>
            )}
          </form>

          {/* Photos — la route d'envoi existait déjà côté serveur mais
              n'était appelée nulle part et rien ne relisait la table
              `photos` : impossible de voir ce qu'on venait d'envoyer. */}
          <div className="pt-6 border-t border-[#2C1B3D] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4145A]" />
                Mes photos
              </h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm px-4 py-2 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploading ? 'Envoi...' : 'Ajouter'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>

            {erreur && (
              <div className="text-sm text-red-300 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {erreur}
              </div>
            )}

            {photosLoading ? (
              <p className="text-zinc-500 text-sm">Chargement des photos...</p>
            ) : photos.length === 0 ? (
              <p className="text-zinc-500 text-sm">Aucune photo pour le moment.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-[#2C1B3D] group"
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {photo.is_cover && (
                      <span className="absolute top-1 left-1 bg-[#D4145A] rounded-full p-1">
                        <Star className="w-3 h-3 text-white" fill="white" />
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(photo.id)}
                      disabled={deletingId === photo.id}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center disabled:opacity-100"
                      title="Supprimer"
                    >
                      {deletingId === photo.id ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#2C1B3D]">
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}