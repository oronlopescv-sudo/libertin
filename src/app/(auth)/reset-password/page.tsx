'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('8 caractères minimum')
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Lien invalide ou expiré')
        return
      }
      router.push('/login?reset=1')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-elevated p-8 border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold font-heading mb-2 text-primary-900 dark:text-primary-100">
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Choisissez votre nouveau mot de passe.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="alert alert-danger text-sm">{error}</div>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe (min. 8 car.)"
            required
            className="w-full"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmer le mot de passe"
            required
            className="w-full"
          />
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Réinitialiser'}
          </button>
        </form>
        {!token && (
          <p className="text-xs text-danger mt-4 text-center">
            Lien invalide.{' '}
            <Link href="/forgot-password" className="underline">
              Demander un nouveau lien
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
