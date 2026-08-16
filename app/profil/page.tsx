'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { LogOut, User, Mail, Camera, Star, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

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
  const { user, isLoading, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [erreur, setErreur] = useState('');

  const chargerPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/photos');
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

      const res = await fetch('/api/photos/upload', { method: 'POST', body: formData });

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
        setErreur(data.error ?? "Échec de l'envoi de la photo");
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
      const res = await fetch(`/api/photos?id=${photoId}`, { method: 'DELETE' });
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
          <div className="text-white">Carregando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#1C102B] border border-[#2C1B3D] rounded-2xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white">Meu Profil</h1>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-[#D4145A]" />
              <div>
                <p className="text-zinc-400 text-sm">Usuário</p>
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

          {/* Photos — la route d'envoi existait déjà côté serveur mais
              n'était appelée nulle part et rien ne relisait la table
              `photos` : impossible de voir ce qu'on venait d'envoyer. */}
          <div className="pt-6 border-t border-[#2C1B3D] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4145A]" />
                Minhas fotos
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