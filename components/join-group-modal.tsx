'use client';

import React, { useState } from 'react';
import { X, Lock, Eye, Loader } from 'lucide-react';
import { joinGroupAnonymous } from '@/lib/anonymous-groups';

interface JoinGroupModalProps {
  groupId: string;
  groupName: string;
  isPremium: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export function JoinGroupModal({
  groupId,
  groupName,
  isPremium,
  onSuccess,
  onClose,
}: JoinGroupModalProps) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setIsLoading(true);
    setError(null);

    const result = await joinGroupAnonymous(groupId, 'current-user-id', isAnonymous);

    if (!result.success) {
      setError(result.error || 'Échec de entrar no grupo');
      setIsLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1C102B] border border-[#3D2654] rounded-2xl p-6 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Se connecter em "{groupName}"</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2C1B3D] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Identified Option */}
          <label className="flex items-start gap-4 p-4 bg-[#160B21] border-2 border-[#2C1B3D] rounded-lg cursor-pointer hover:border-[#D4145A]/40 transition-all">
            <input
              type="radio"
              name="mode"
              checked={!isAnonymous}
              onChange={() => setIsAnonymous(false)}
              className="w-5 h-5 mt-0.5"
            />
            <div className="flex-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#D4145A]" />
                Se connecter como seu nome
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Votre profil vérifié sera visible. Les autres membres sauront qui vous êtes.
              </div>
            </div>
          </label>

          {/* Anonymous Option */}
          <label className="flex items-start gap-4 p-4 bg-[#160B21] border-2 border-[#2C1B3D] rounded-lg cursor-pointer hover:border-[#D4145A]/40 transition-all">
            <input
              type="radio"
              name="mode"
              checked={isAnonymous}
              onChange={() => setIsAnonymous(true)}
              className="w-5 h-5 mt-0.5"
            />
            <div className="flex-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4145A]" />
                Se connecter Anonyme ⭐
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Seu nome será "Anonyme #XXXX". Ninguém saberá sua identidade.
              </div>

              {!isPremium && (
                <div className="text-xs text-amber-400 mt-2 bg-amber-950/30 p-2 rounded border border-amber-800/30">
                  ⚠️ Requer assinatura PREMIUM
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-[#D4145A]/10 border border-[#D4145A]/30 rounded-lg text-xs text-[#E86B7A]">
          <strong>Como funciona:</strong>
          <ul className="mt-2 space-y-1 text-zinc-300">
            <li>• Vous vê todos os membros como identificados</li>
            <li>• Mas outros só veem vous como "Anonyme"</li>
            <li>• Nenhuma foto ou localizaction compartilhada</li>
            <li>• Permaneça discreto e seguro</li>
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 bg-[#2C1B3D] text-white rounded-lg font-bold text-sm hover:bg-[#3D2654] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleJoin}
            disabled={isLoading || (isAnonymous && !isPremium)}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white rounded-lg font-bold text-sm hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              <>Confirmer Entrada</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
