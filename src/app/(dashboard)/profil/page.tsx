'use client'

import { useState, useEffect } from 'react'

interface Profile {
  username: string
  email: string
  gender: string
  sexualOrientation: string
  location: string
  bio: string | null
  interests: string[]
  isVerified: boolean
  subscriptionTier: string
  subscriptionEnd: string | null
  photos: { id: string; url: string; isCover: boolean }[]
}

const interestOptions = [
  'Soirées privées',
  'Clubs',
  'Voyages',
  'Gastronomie',
  'Danse',
  'Nature',
  'Art & culture',
  'Sport',
  'Bien-être',
  'Musique',
]

const genderLabels: Record<string, string> = {
  homme: 'Homme solo',
  femme: 'Femme solo',
  couple: 'Couple',
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [verifSent, setVerifSent] = useState(false)

  const uploadPhoto = async (file: File, type: 'cover' | 'gallery' | 'verification') => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      const res = await fetch('/api/users/upload-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'envoi")
        return
      }
      if (type === 'verification') {
        setVerifSent(true)
      } else {
        // Recharger le profil pour afficher la nouvelle photo
        const r = await fetch('/api/users/profile')
        const d = await r.json()
        if (d.user) setProfile(d.user)
      }
    } finally {
      setUploading(false)
    }
  }

  const deletePhoto = async (photoId: string) => {
    await fetch('/api/users/upload-photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId }),
    })
    const r = await fetch('/api/users/profile')
    const d = await r.json()
    if (d.user) setProfile(d.user)
  }

  const [form, setForm] = useState({
    username: '',
    bio: '',
    location: '',
    interests: [] as string[],
  })

  useEffect(() => {
    fetch('/api/users/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user)
          setForm({
            username: data.user.username ?? '',
            bio: data.user.bio ?? '',
            location: data.user.location ?? '',
            interests: data.user.interests ?? [],
          })
        }
      })
  }, [])

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la sauvegarde')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse-soft" />
      </div>
    )
  }

  const isPremium = profile.subscriptionEnd && new Date(profile.subscriptionEnd) > new Date()

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary-900 dark:text-primary-100 mb-8">
        Mon profil
      </h1>

      {/* En-tête du profil */}
      <div className="card mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-3xl">
          {profile.gender === 'couple' ? '👫' : profile.gender === 'femme' ? '👩' : '👨'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg truncate">{profile.username}</p>
            {profile.isVerified && <span title="Profil vérifié">✅</span>}
            {isPremium && <span className="badge badge-primary text-xs">⭐ Premium</span>}
          </div>
          <p className="text-sm text-slate-500">
            {genderLabels[profile.gender]} · {profile.email}
          </p>
        </div>
      </div>

      {!profile.isVerified && (
        <div className="alert alert-warning mb-8 text-sm">
          {verifSent ? (
            <p>✅ Photo de vérification envoyée ! Elle sera examinée sous 24h.</p>
          ) : (
            <>
              <p className="mb-3">
                ⚠️ Votre profil n&apos;est pas encore vérifié. Envoyez un selfie avec votre
                pièce d&apos;identité visible pour obtenir le badge ✅.
              </p>
              <label className="inline-block px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-primary-700 transition-colors">
                {uploading ? 'Envoi...' : '📷 Envoyer ma photo de vérification'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadPhoto(f, 'verification')
                  }}
                />
              </label>
            </>
          )}
        </div>
      )}

      {/* Mes photos */}
      <section className="mb-8">
        <h2 className="font-bold font-heading text-slate-900 dark:text-slate-100 mb-3">
          Mes photos
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {profile.photos?.map((p) => (
            <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="w-full h-full object-cover" />
              {p.isCover && (
                <span className="absolute top-1 left-1 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Couverture
                </span>
              )}
              <button
                type="button"
                onClick={() => deletePhoto(p.id)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-primary-400 hover:text-primary-500 transition-colors">
            <span className="text-2xl">+</span>
            <span className="text-[10px] font-semibold">
              {uploading ? 'Envoi...' : 'Ajouter'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) uploadPhoto(f, 'gallery')
              }}
            />
          </label>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          JPEG, PNG ou WebP · 5 Mo max · La première photo devient votre couverture
        </p>
      </section>

      {/* Formulaire */}
      <form onSubmit={handleSave} className="space-y-6">
        {error && <div className="alert alert-danger text-sm">{error}</div>}
        {saved && <div className="alert alert-success text-sm">✓ Profil mis à jour</div>}

        <div>
          <label className="block text-sm font-semibold mb-2">Pseudo</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            minLength={3}
            maxLength={24}
            className="w-full"
          />
          <p className="text-xs text-slate-500 mt-1">
            Votre pseudo est visible par les autres membres. Jamais votre email.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Localisation</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Ex : Lyon, Rhône-Alpes"
            maxLength={100}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Bio <span className="text-slate-400 font-normal">({form.bio.length}/500)</span>
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Présentez-vous en quelques mots..."
            rows={4}
            maxLength={500}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Centres d&apos;intérêt</label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  form.interests.includes(interest)
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  )
}
