'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    sexualOrientation: '',
  })

  const [pseudo, setPseudo] = useState('')
  const [pays, setPays] = useState('France')

  // Pré-remplissage depuis le formulaire rapide de la homepage (format Libertic)
  useEffect(() => {
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    const gender = searchParams.get('gender')
    const p = searchParams.get('pseudo')
    const c = searchParams.get('pays')
    if (p) setPseudo(p)
    if (c) setPays(c)
    if (email || gender || password) {
      setFormData((prev) => ({
        ...prev,
        email: email ?? prev.email,
        password: password ?? prev.password,
        confirmPassword: password ?? prev.confirmPassword,
        gender: gender ?? prev.gender,
      }))
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Étape 1: Valider données
      if (!formData.email || !formData.password) {
        setError('Tous les champs sont obligatoires')
        return
      }

      if (formData.password.length < 8) {
        setError('Le mot de passe doit avoir au moins 8 caractères')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }

      // Vérifier l'âge (18+)
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (age < 18 || (age === 18 && monthDiff < 0)) {
        setError('Vous devez être âgé de 18 ans minimum')
        return
      }

      // Appel API d'enregistrement
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          sexualOrientation: formData.sexualOrientation,
          username: pseudo || undefined,
          pays,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de l\'enregistrement')
        return
      }

      // Rediriger vers vérification email
      router.push('/verify-email?email=' + encodeURIComponent(formData.email))
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
            Créer un compte
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Rejoignez notre communauté de rencontres premium
          </p>

          {/* Stepper */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <>
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
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 caractères"
                    required
                    className="w-full"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Répétez le mot de passe"
                    required
                    className="w-full"
                  />
                </div>

                {/* Conditions */}
                <div className="flex items-start gap-3 mt-6">
                  <input type="checkbox" required className="mt-1" />
                  <label className="text-xs text-slate-600 dark:text-slate-400">
                    Je certifie être âgé de 18 ans minimum et j'accepte les{' '}
                    <Link href="/cgv" className="text-primary-600 hover:text-primary-700 underline">
                      conditions générales
                    </Link>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow"
                >
                  Suivant
                </button>
              </>
            ) : (
              <>
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Type de profil
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="homme">Homme solo</option>
                    <option value="femme">Femme solo</option>
                    <option value="couple">Couple</option>
                  </select>
                </div>

                {/* Sexual Orientation */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Orientation
                  </label>
                  <select
                    name="sexualOrientation"
                    value={formData.sexualOrientation}
                    onChange={handleChange}
                    required
                    className="w-full"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="hetero">Hétérosexuel(le)</option>
                    <option value="homo">Homosexuel(le)</option>
                    <option value="bi">Bisexuel(le)</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Créer le compte'}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
