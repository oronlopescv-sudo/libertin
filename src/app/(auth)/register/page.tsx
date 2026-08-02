'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToRules, setAgreedToRules] = useState(false)
  const [ruleCheckbox, setRuleCheckbox] = useState(false)

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
    const gender = searchParams.get('gender')
    const p = searchParams.get('pseudo')
    const c = searchParams.get('pays')

    // Le mot de passe vient du sessionStorage (jamais de l'URL) et n'est
    // lu qu'une seule fois.
    let password: string | null = null
    try {
      password = sessionStorage.getItem('inscription:password')
      if (password) sessionStorage.removeItem('inscription:password')
    } catch {
      password = null
    }

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Étape 1: Valider données
      if (!formData.email || !formData.password) {
        setError('Tous les champs sont obligatoires')
        setLoading(false)
        return
      }

      if (!formData.gender) {
        setError('Veuillez sélectionner votre type de profil')
        setLoading(false)
        return
      }

      if (!formData.sexualOrientation) {
        setError('Veuillez sélectionner votre orientation')
        setLoading(false)
        return
      }

      if (formData.password.length < 8) {
        setError('Le mot de passe doit avoir au moins 8 caractères')
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        setLoading(false)
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

      // Connexion automatique après inscription
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        // Rechargement complet : le routeur client a pu mettre en cache la
        // redirection du middleware émise pendant que le visiteur était
        // encore déconnecté. Voir le commentaire détaillé dans /login.
        window.location.assign('/decouvrir')
      } else {
        // Le compte est créé : on renvoie vers la connexion manuelle
        router.push('/login?registered=1')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur réseau. Vérifiez votre connexion et réessayez.')
    } finally {
      setLoading(false)
    }
  }, [formData, pseudo, pays, router])

  // Modal de acceptação de règles
  if (!agreedToRules) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-elevated p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-3xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold font-heading text-primary-900 dark:text-primary-100 mb-2">
                Important — Avant de continuer
              </h1>
            </div>

            <div className="bg-primary-50 dark:bg-primary-950/30 border-l-4 border-primary-600 p-5 rounded mb-6">
              <div className="space-y-4 text-slate-900 dark:text-slate-100">
                <p className="font-semibold text-lg">
                  ⚠️ Ce site est réservé aux adultes de 18 ans et plus
                </p>
                <p className="text-sm leading-relaxed">
                  En accédant à Libertinelover, vous confirmez que vous avez 18 ans ou plus et que vous acceptez nos règles de respect mutuel.
                </p>

                <div className="bg-white dark:bg-slate-800 p-4 rounded border border-primary-200 dark:border-primary-800">
                  <p className="font-semibold text-base mb-2">
                    💚 Ici, on ne plaisante pas — on fait des choses bien
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>✓ Respect et consentement mutuel : toujours</li>
                    <li>✓ Confidentialité garantie de vos photos et données</li>
                    <li>✓ Zéro tolérance pour le harcèlement et les abus</li>
                    <li>✓ Profils vérifiés : sécurité au cœur de notre plateforme</li>
                    <li>✓ Communauté bienveillante d&apos;adultes responsables</li>
                  </ul>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  Si vous êtes ici, c&apos;est que vous recherchez des rencontres sérieuses et respectueuses. Nous ne tolérons pas les contrefacteurs, les mensonges sur l&apos;âge, ou le non-consentement. Bienvenue parmi nous.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={ruleCheckbox}
                onChange={(e) => setRuleCheckbox(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-slate-300"
              />
              <span className="text-sm text-slate-900 dark:text-slate-100">
                Je confirme avoir 18 ans ou plus et j&apos;accepte les règles de respect de cette communauté
              </span>
            </label>

            <button
              onClick={() => {
                if (ruleCheckbox) {
                  setAgreedToRules(true)
                }
              }}
              disabled={!ruleCheckbox}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Je comprends et j&apos;accepte
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full py-2 mt-3 text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Retourner à la page d&apos;accueil
            </button>
          </div>
        </div>
      </div>
    )
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
            Libertinelover
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
                    Je certifie être âgé de 18 ans minimum et j&apos;accepte les{' '}
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
