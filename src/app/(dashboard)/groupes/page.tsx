'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Group {
  id: string
  name: string
  description: string | null
  category: string
  isPrivate: boolean
  maxMembers: number
  _count: { members: number }
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  casual: { label: 'Décontracté', emoji: '🍸' },
  aventure: { label: 'Aventure', emoji: '🔥' },
  discretion: { label: 'Discrétion', emoji: '🤫' },
  prive: { label: 'Message privé', emoji: '💌' },
}

export default function GroupesPage() {
  const router = useRouter()
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [publicGroups, setPublicGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', category: 'casual', isPrivate: false })

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/groups')
      if (res.ok) {
        const data = await res.json()
        setMyGroups(data.myGroups ?? [])
        setPublicGroups(data.publicGroups ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      if (data.premiumRequired) {
        router.push('/abonnements')
        return
      }
      setError(data.error ?? 'Erreur lors de la création')
      return
    }

    setShowCreate(false)
    setForm({ name: '', description: '', category: 'casual', isPrivate: false })
    fetchGroups()
  }

  const handleJoin = async (groupId: string) => {
    const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' })
    const data = await res.json()

    if (!res.ok && data.premiumRequired) {
      router.push('/abonnements')
      return
    }
    if (res.ok) {
      router.push(`/chat/${groupId}`)
    }
  }

  const GroupCard = ({ group, isMember }: { group: Group; isMember: boolean }) => {
    const cat = categoryLabels[group.category] ?? categoryLabels.casual
    return (
      <div className="card flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{cat.emoji}</div>
          <span className="badge badge-primary text-xs">{cat.label}</span>
        </div>
        <h3 className="font-bold font-heading text-lg text-slate-900 dark:text-slate-100 mb-1">
          {group.isPrivate && '🔒 '}
          {group.name}
        </h3>
        {group.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {group.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {group._count.members}/{group.maxMembers} membres
          </span>
          {isMember ? (
            <Link
              href={`/chat/${group.id}`}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ouvrir le chat
            </Link>
          ) : (
            <button
              onClick={() => handleJoin(group.id)}
              className="px-4 py-2 border border-primary-600 text-primary-600 text-sm font-semibold rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
            >
              Rejoindre
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary-900 dark:text-primary-100 mb-1">
            Groupes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Créez et rejoignez des groupes de discussion privés
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow whitespace-nowrap"
        >
          + Créer
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse-soft" />
          ))}
        </div>
      ) : (
        <>
          {myGroups.length > 0 && (
            <section className="mb-10">
              <h2 className="font-bold font-heading text-lg mb-4 text-slate-900 dark:text-slate-100">
                Mes groupes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.map((g) => (
                  <GroupCard key={g.id} group={g} isMember />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-bold font-heading text-lg mb-4 text-slate-900 dark:text-slate-100">
              Groupes publics
            </h2>
            {publicGroups.length === 0 ? (
              <div className="text-center py-16 card">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Aucun groupe public pour le moment. Soyez le premier à en créer un !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicGroups.map((g) => (
                  <GroupCard key={g.id} group={g} isMember={false} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal création */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-bold font-heading mb-6 text-slate-900 dark:text-slate-100">
              Créer un groupe
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="alert alert-danger text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-2">Nom du groupe</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex : Soirées Paris Ouest"
                  required
                  minLength={3}
                  maxLength={60}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez l'ambiance du groupe..."
                  rows={3}
                  maxLength={500}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Catégorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full"
                >
                  <option value="casual">🍸 Décontracté</option>
                  <option value="aventure">🔥 Aventure</option>
                  <option value="discretion">🤫 Discrétion</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={form.isPrivate}
                  onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
                />
                <label htmlFor="isPrivate" className="text-sm">
                  Groupe privé (sur invitation)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-lg"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
