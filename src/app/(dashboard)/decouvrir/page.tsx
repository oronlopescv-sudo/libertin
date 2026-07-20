'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  username: string
  gender: string
  orientation: string
  location: string
  bio: string | null
  isVerified: boolean
  age: number
  coverPhoto: string | null
}

const genderLabels: Record<string, string> = {
  homme: 'Homme',
  femme: 'Femme',
  couple: 'Couple',
}

const genderEmojis: Record<string, string> = {
  homme: '👨',
  femme: '👩',
  couple: '👫',
}

export default function DecouvrirPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [premiumRequired, setPremiumRequired] = useState(false)
  const [filter, setFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (filter) params.set('gender', filter)

      const res = await fetch(`/api/users/discover?${params}`)
      const data = await res.json()

      if (res.status === 403 && data.premiumRequired) {
        setPremiumRequired(true)
        return
      }

      setProfiles(data.profiles ?? [])
      setTotalPages(data.totalPages ?? 1)
      setPremiumRequired(false)
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  // Écran paywall pour comptes gratuits
  if (premiumRequired) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold font-heading mb-4 text-primary-900 dark:text-primary-100">
            Réservé aux membres Premium
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            L&apos;accès aux profils est gratuit pour les femmes et les couples. En tant
            qu&apos;homme, activez votre abonnement Premium pour découvrir tous les couples et
            célibataires près de chez vous — c&apos;est ce qui garantit notre proportion unique
            de 76% de femmes et couples.
          </p>
          <Link
            href="/abonnements"
            className="inline-block px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-elevated transition-shadow"
          >
            Voir les abonnements — dès 16€
          </Link>
          <p className="text-xs text-slate-500 mt-4">Sans engagement · Paiement sécurisé Stripe</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary-900 dark:text-primary-100 mb-2">
          Découvrir
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Couples et célibataires actifs récemment
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { value: '', label: 'Tous' },
          { value: 'couple', label: '👫 Couples' },
          { value: 'femme', label: '👩 Femmes' },
          { value: 'homme', label: '👨 Hommes' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value)
              setPage(1)
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grille de profils */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse-soft"
            />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌙</div>
          <p className="text-slate-600 dark:text-slate-400">
            Aucun profil ne correspond à ce filtre pour le moment.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => router.push(`/membre/${profile.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/membre/${profile.id}`)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary-500 to-secondary-900 shadow-card hover:shadow-elevated hover:scale-[1.02] transition-all cursor-pointer"
              >
                {profile.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.coverPhoto}
                    alt={profile.username}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {genderEmojis[profile.gender] ?? '👤'}
                  </div>
                )}

                {/* Overlay infos */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white font-bold truncate">{profile.username}</p>
                    {profile.isVerified && <span title="Profil vérifié">✅</span>}
                  </div>
                  <p className="text-white/80 text-sm">
                    {genderLabels[profile.gender]} · {profile.age} ans
                  </p>
                  {profile.location && (
                    <p className="text-white/60 text-xs truncate">📍 {profile.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                ← Précédent
              </button>
              <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
