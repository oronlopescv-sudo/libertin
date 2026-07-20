'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface MemberProfile {
  id: string
  username: string
  gender: string
  orientation: string
  location: string
  bio: string | null
  interests: string[]
  isVerified: boolean
  age: number
  lastSeen: string | null
  photos: { url: string; isCover: boolean }[]
}

const genderLabels: Record<string, string> = {
  homme: 'Homme',
  femme: 'Femme',
  couple: 'Couple',
}
const orientationLabels: Record<string, string> = {
  hetero: 'Hétérosexuel(le)',
  homo: 'Homosexuel(le)',
  bi: 'Bisexuel(le)',
}
const genderEmojis: Record<string, string> = { homme: '👨', femme: '👩', couple: '👫' }

export default function MembrePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.status === 403 && data.premiumRequired) {
          router.push('/abonnements')
          return
        }
        if (!res.ok) {
          setNotFound(true)
          return
        }
        setProfile(data.profile)
      })
      .catch(() => setNotFound(true))
  }, [id, router])

  const startConversation = async () => {
    setStarting(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: id }),
      })
      const data = await res.json()
      if (res.status === 403 && data.premiumRequired) {
        router.push('/abonnements')
        return
      }
      if (data.groupId) {
        router.push(`/chat/${data.groupId}`)
      }
    } finally {
      setStarting(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🌙</div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Profil introuvable.</p>
          <Link
            href="/decouvrir"
            className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl"
          >
            ← Retour à Découvrir
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse-soft" />
      </div>
    )
  }

  const cover = profile.photos.find((p) => p.isCover) ?? profile.photos[0]

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Link
        href="/decouvrir"
        className="inline-block text-slate-500 hover:text-primary-600 text-sm mb-4"
      >
        ← Retour à Découvrir
      </Link>

      {/* Photo de couverture */}
      <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary-500 to-secondary-900 mb-6">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt={profile.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            {genderEmojis[profile.gender] ?? '👤'}
          </div>
        )}
      </div>

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {profile.username}
            {profile.isVerified && <span title="Profil vérifié">✅</span>}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {genderLabels[profile.gender]} · {profile.age} ans ·{' '}
            {orientationLabels[profile.orientation] ?? profile.orientation}
          </p>
          {profile.location && (
            <p className="text-sm text-slate-500 mt-1">📍 {profile.location}</p>
          )}
        </div>
      </div>

      {/* Bouton message — l'action principale */}
      <button
        onClick={startConversation}
        disabled={starting}
        className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-elevated transition-shadow disabled:opacity-50 mb-8"
      >
        {starting ? 'Ouverture...' : '💌 Envoyer un message privé'}
      </button>

      {/* Bio */}
      {profile.bio && (
        <section className="mb-8">
          <h2 className="font-bold font-heading text-slate-900 dark:text-slate-100 mb-2">
            À propos
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        </section>
      )}

      {/* Intérêts */}
      {profile.interests.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold font-heading text-slate-900 dark:text-slate-100 mb-3">
            Centres d&apos;intérêt
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span key={interest} className="badge badge-primary text-xs">
                {interest}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Galerie */}
      {profile.photos.length > 1 && (
        <section>
          <h2 className="font-bold font-heading text-slate-900 dark:text-slate-100 mb-3">
            Photos
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {profile.photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={p.url}
                alt=""
                className="aspect-square object-cover rounded-xl"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
