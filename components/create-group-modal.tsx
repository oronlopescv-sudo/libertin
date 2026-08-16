'use client';

import React, { useState } from 'react';
import { fetchResilient } from '@/lib/fetch-resilient';
import Link from 'next/link';
import { X, Lock } from 'lucide-react';
import { isPremium as isPremiumFn } from '@/lib/premium';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAbonnement: {
    tier: string;
    expiresAt: string | null;
  };
}

export function CreateGroupModal({ isOpen, onClose, userAbonnement }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState(100);
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isPremium = isPremiumFn({
    subscriptionTier: userAbonnement.tier,
    subscriptionEnd: userAbonnement.expiresAt,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPremium) {
      setError('Apenas utilisateurs Premium podem criar grupos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetchResilient('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          isPrivate,
          maxMembers,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création du groupe');
      }

      setSuccess(true);
      setName('');
      setDescription('');
      setIsPrivate(false);
      setMaxMembers(100);
      setCategory('general');

      // Fermer modal após sucesso
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C102B] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#2C1B3D]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2C1B3D] sticky top-0 bg-[#1C102B]">
          <h2 className="text-lg font-bold text-white">Criar Groupe</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isPremium ? (
            // Premium Required
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#D4145A]/20 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-[#D4145A]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Premium Apenas</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Seuls les utilisateurs avec un abonnement Premium peuvent créer des groupes.
                </p>
              </div>
              <Link
                href="/abonnements"
                className="w-full py-2 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition inline-block"
              >
                Fazer Upgrade
              </Link>
              <button
                onClick={onClose}
                className="w-full py-2 bg-[#2C1B3D] rounded-lg font-semibold text-white hover:bg-[#3C2B4D] transition"
              >
                Annuler
              </button>
            </div>
          ) : (
            // Form (Premium)
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm">
                  ✓ Groupe criado avec succès!
                </div>
              )}

              {/* Nome */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F5F0F8]">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Libertin Paris 25+"
                  className="w-full px-4 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A]"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F5F0F8]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreve o grupo..."
                  rows={3}
                  className="w-full px-4 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4145A] resize-none"
                />
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F5F0F8]">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-[#2C1B3D] border border-[#3C2B4D] rounded-lg text-white focus:outline-none focus:border-[#D4145A]"
                >
                  <option value="general">Geral</option>
                  <option value="couples">Couples</option>
                  <option value="singles">Célibataires</option>
                  <option value="women">Femmes</option>
                  <option value="events">Événements</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              {/* Max Members */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F5F0F8]">
                  Máx Membros ({maxMembers})
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Privé */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  id="private-checkbox"
                  className="w-4 h-4 accent-[#D4145A]"
                />
                <label htmlFor="private-checkbox" className="text-sm text-[#F5F0F8]">
                  Groupe privé (convite apenas)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 bg-[#2C1B3D] rounded-lg font-semibold text-white hover:bg-[#3C2B4D] transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Criando...' : 'Criar Groupe'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
