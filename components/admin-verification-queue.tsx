'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import {
  Check,
  X,
  AlertTriangle,
  Clock,
  Loader,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface VerificationUser {
  username: string;
  email: string;
  age: number | null;
  gender: string | null;
  location: string | null;
}

interface PendingPhoto {
  id: string;
  url: string;
  status: string;
  created_at: string;
  user: VerificationUser;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
}

/**
 * File d'attente de vérification des selfies (panneau admin).
 *
 * Toutes les actions passent par les routes /api/admin/verifications (gate
 * serveur via utilisateurAdmin). Aucune logique privilégiée n'est importée
 * côté client — l'ancienne version importait lib/photo-verification.ts (qui
 * construit un client Supabase service-role) et hardcodait adminId='admin-id'.
 */
export function VerificationQueuePanel() {
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [erreur, setErreur] = useState('');

  const loadVerifications = useCallback(async () => {
    setIsLoading(true);
    setErreur('');
    try {
      const res = await fetchResilient('/api/admin/verifications');
      const data = await res.json();
      if (res.ok) {
        setPhotos(data.photos ?? []);
        setStats(data.stats ?? null);
      } else {
        setErreur(data.error ?? 'Erreur lors du chargement');
      }
    } catch {
      setErreur('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  const currentPhoto = photos[currentIndex];

  const removeCurrentAndAdvance = () => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== currentIndex);
      if (currentIndex >= next.length) {
        setCurrentIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleApprove = async () => {
    if (!currentPhoto) return;
    setIsProcessing(true);
    setErreur('');
    try {
      const res = await fetchResilient(
        `/api/admin/verifications/${currentPhoto.id}/approve`,
        { method: 'POST' }
      );
      if (res.ok) {
        removeCurrentAndAdvance();
        await loadVerifications();
      } else {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error ?? "Échec de l'approbation");
      }
    } catch {
      setErreur('Erreur réseau');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentPhoto || !rejectionReason.trim()) return;
    setIsProcessing(true);
    setErreur('');
    try {
      const res = await fetchResilient(
        `/api/admin/verifications/${currentPhoto.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );
      if (res.ok) {
        removeCurrentAndAdvance();
        setRejectionReason('');
        setShowRejectModal(false);
        await loadVerifications();
      } else {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error ?? 'Échec du rejet');
      }
    } catch {
      setErreur('Erreur réseau');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-[#D4145A]" />
          <p className="text-zinc-400">Chargement de la queue de vérification...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Aucune vérification en attente
        </h3>
        <p className="text-zinc-400">Toutes les photos ont été vérifiées ! 🎉</p>
      </div>
    );
  }

  const photo = currentPhoto;
  const progress = Math.round(((currentIndex + 1) / photos.length) * 100);

  return (
    <div className="space-y-6">
      {erreur && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
          {erreur}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-[#1C102B] border border-[#2C1B3D] rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">En Attente</div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
          </div>
          <div className="p-4 bg-[#1C102B] border border-[#2C1B3D] rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Approuvées</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.approved}</div>
          </div>
          <div className="p-4 bg-[#1C102B] border border-[#2C1B3D] rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Rejetées</div>
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
          </div>
          <div className="p-4 bg-[#1C102B] border border-[#2C1B3D] rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Taux d'approbation</div>
            <div className="text-2xl font-bold text-[#E86B7A]">{stats.approvalRate}%</div>
          </div>
        </div>
      )}

      {/* Photo Viewer */}
      <div className="bg-[#1C102B] border border-[#2C1B3D] rounded-2xl overflow-hidden">
        {/* Photo */}
        <div className="aspect-video bg-black relative overflow-hidden">
          <img
            src={photo.url}
            alt="Vérification"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 rounded-full text-xs text-white">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Utilisateur</div>
              <div className="font-bold text-white">{photo.user.username}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">Email</div>
              <div className="text-sm text-zinc-300">{photo.user.email}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">Âge</div>
              <div className="font-bold text-white">
                {photo.user.age !== null ? `${photo.user.age} ans` : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">Genre</div>
              <div className="font-bold text-white">
                {photo.user.gender === 'couple'
                  ? 'Couple'
                  : photo.user.gender === 'femme'
                  ? 'Femme'
                  : photo.user.gender === 'homme'
                  ? 'Homme'
                  : photo.user.gender ?? '—'}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-zinc-400 mb-1">Localisation</div>
              <div className="text-sm text-zinc-300">{photo.user.location ?? '—'}</div>
            </div>
          </div>

          {/* Submission Date */}
          <div className="flex items-center gap-2 p-3 bg-[#160B21] border border-[#2C1B3D] rounded-lg">
            <Clock className="w-4 h-4 text-zinc-400" />
            <div className="text-xs text-zinc-400">
              Soumis le{' '}
              {new Date(photo.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 rounded-lg font-bold text-sm hover:bg-emerald-950 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isProcessing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Approuver</span>
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-red-950/80 border border-red-800/40 text-red-300 rounded-lg font-bold text-sm hover:bg-red-950 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Rejeter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Progression</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-[#1C102B] rounded-full overflow-hidden border border-[#2C1B3D]">
          <div
            className="h-full bg-gradient-to-r from-[#D4145A] to-[#E86B7A] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex-1 py-2 px-3 bg-[#1C102B] border border-[#2C1B3D] text-zinc-300 rounded-lg hover:border-[#3D2654] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </button>

        <button
          onClick={() => setCurrentIndex(Math.min(photos.length - 1, currentIndex + 1))}
          disabled={currentIndex === photos.length - 1}
          className="flex-1 py-2 px-3 bg-[#1C102B] border border-[#2C1B3D] text-zinc-300 rounded-lg hover:border-[#3D2654] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1C102B] border border-[#3D2654] rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Rejeter la photo</h3>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-2">
                Raison du rejet (visible par l'utilisateur)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Photo floue, pas de papier avec la date..."
                className="w-full p-3 bg-[#12091A] border border-[#2C1B3D] rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#D4145A] text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 px-3 bg-[#2C1B3D] text-white rounded-lg font-bold text-sm hover:bg-[#3D2654]"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isProcessing}
                className="flex-1 py-2 px-3 bg-red-950/80 border border-red-800/40 text-red-300 rounded-lg font-bold text-sm hover:bg-red-950 disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}