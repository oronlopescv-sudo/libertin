'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetDone = searchParams.get('reset') === '1'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (!result?.ok) {
        setError(result?.error || 'Erreur de connexion')
        return
      }

      router.push('/decouvrir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">RP</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-primary-900 dark:text-primary-100">
            RencontresPremium
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-elevated p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold font-heading mb-2 text-primary-900 dark:text-primary-100">
            Se connecter
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Bienvenue ! Connectez-vous à votre compte
          </p>

          {resetDone && (
            <div className="alert alert-success mb-4 text-sm">
              ✓ Mot de passe réinitialisé. Connectez-vous avec votre nouveau mot de passe.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@exemple.fr"
                required
                className="w-full"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                required
                className="w-full"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">
                Se souvenir de moi
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Ou continuer avec
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={() => signIn('google', { redirect: false })}
            className="w-full py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          {/* Register Link */}
          <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
            Pas encore inscrit ?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Créer un compte
            </Link>
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-8 text-center text-xs text-slate-600 dark:text-slate-400">
          <p>🔒 Vos données sont sécurisées et chiffrées</p>
          <p className="mt-2">💳 Nous ne stockons jamais votre numéro de carte</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
