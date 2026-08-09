'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Upload, Check, Camera, Lock, X, AlertCircle } from 'lucide-react';

interface PhotoVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoVerificationModal({ isOpen, onClose }: PhotoVerificationModalProps) {
  // const { ... } = useAuth();
  const user = null;
  const isPremium = false;
  const logout = () => {};
  const upgradeSubscription = () => {};
  const refreshUser = () => {};
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!photoUrl) {
      setErrorMsg('Veuillez sélectionner ou fournir une photo.');
      return;
    }

    setIsUploading(true);

    try {
      const { error } = await supabase.from('verification_photos').insert({
        user_id: user.id,
        url: photoUrl,
        status: 'pending',
      });

      if (error) throw error;

      await refreshUser();
      setIsUploading(false);
      setSubmitted(true);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err?.message || "Erreur lors de l'envoi de la photo.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#1C102B] border border-[#3D2654] rounded-2xl shadow-2xl p-6 text-white space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#2C1B3D] text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Vérification de Profil</h3>
            <p className="text-xs text-zinc-400">Badge réservé aux profils authentiques</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-300">Demande Transmise à l&apos;Équipe</h4>
            <p className="text-xs text-zinc-300">
              Votre selfie de vérification a été transmis. Notre modérateur examinera votre cliché sous 2 heures max.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2C1B3D] text-white text-xs font-bold"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-[#2C1B3D] border border-[#3D2654] text-xs text-zinc-300 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#E86B7A]" />
                <span>Instructions pour la vérification :</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>Selfie montrant distinctement votre visage ou votre duo</li>
                <li>Tenez un mot manuscrit indiquant &quot;xlibertine&quot; + date</li>
                <li>Photo strictement confidentielle (non affichée publiquement)</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Transmettre votre selfie de vérification
              </label>

              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#12091A] border border-dashed border-[#3D2654] hover:border-[#D4145A] cursor-pointer text-zinc-300 text-xs transition-colors">
                  <Upload className="w-4 h-4 text-[#E86B7A]" />
                  <span>{photoUrl ? "Image sélectionnée (Modifier)" : "Choisir un fichier image de votre appareil"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {photoUrl && photoUrl.startsWith('data:image') && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#D4145A] mx-auto">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="text-center text-[10px] text-zinc-500 uppercase tracking-wider font-bold">ou via lien direct</div>

                <input
                  type="text"
                  placeholder="https://... (lien URL de l'image)"
                  value={photoUrl.startsWith('data:image') ? '' : photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#12091A] border border-[#3D2654] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Le stockage de fichiers (Supabase Storage) n&apos;est pas encore configuré.
                Pour tester, utilisez un lien URL direct ou converta a imagem em base64.
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-[#E86B7A]" />
              <span>Conforme aux normes RGPD & Destruction automatique après validation</span>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold hover:opacity-95 shadow-lg flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <span>Validation en cours...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Soumettre ma photo pour vérification</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
