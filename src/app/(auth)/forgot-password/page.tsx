'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-elevated p-8 border border-slate-200 dark:border-slate-700">
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-xl font-bold font-heading mb-3 text-primary-900 dark:text-primary-100">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, un lien de
              réinitialisation vient d&apos;être envoyé. Pensez à vérifier vos spams.
            </p>
            <Link href="/login" className="text-primary-600 font-semibold text-sm hover:underline">
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold font-heading mb-2 text-primary-900 dark:text-primary-100">
              Mot de passe oublié
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Indiquez votre email et nous vous enverrons un lien pour réinitialiser votre mot
              de passe.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                required
                className="w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                ← Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
