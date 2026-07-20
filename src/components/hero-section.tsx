'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function HeroSection() {
  const router = useRouter()
  const [stats, setStats] = useState({ femmesCouplesPct: 78.0, hommesPct: 22.0 })
  const [gender, setGender] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [pays, setPays] = useState('')
  const [major, setMajor] = useState(false)
  const [rgpd, setRgpd] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.femmesCouplesPct) setStats(d)
      })
      .catch(() => {})
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!gender) return setError('Sélectionnez votre profil')
    if (pseudo.length < 4 || pseudo.length > 16)
      return setError('Le pseudo doit contenir 4 à 16 caractères')
    if (password.length < 8 || password.length > 16)
      return setError('Le mot de passe doit contenir 8 à 16 caractères')
    if (!pays) return setError('Choisissez votre pays')
    if (!major || !rgpd) return setError('Vous devez accepter les conditions')

    const params = new URLSearchParams({ gender, pseudo, password, pays })
    router.push(`/register?${params.toString()}`)
  }

  return (
    <section className="bg-gradient-to-b from-secondary-900 via-secondary-700 to-primary-700 text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-16">
        {/* Titres centrés — format Libertic */}
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-heading text-accent-300 mb-1">
            Plaisirs et Libertinage
          </h2>
          <h1 className="text-2xl md:text-4xl font-bold font-heading">
            Bienvenue sur le 1<sup>er</sup> réseau social pour les couples et célibataires
          </h1>
        </div>

        {/* Compteur ratio — bandeau central comme Libertic */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-sm text-white/80 mb-3 capitalize">Membres actifs au {today}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
            <div className="flex-1 bg-white/10 backdrop-blur rounded-xl px-6 py-4 border border-white/20">
              <p className="text-2xl md:text-3xl font-bold font-heading text-accent-300">
                {stats.femmesCouplesPct.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %
              </p>
              <p className="text-sm text-white/90">Femmes et Couples</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl px-6 py-4 border border-white/10">
              <p className="text-2xl md:text-3xl font-bold font-heading text-white/70">
                {stats.hommesPct.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %
              </p>
              <p className="text-sm text-white/70">Hommes</p>
            </div>
          </div>
        </div>

        {/* Illustration + formulaire — 2 colonnes comme Libertic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Illustration gauche */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-72 h-72 rounded-full bg-gradient-to-br from-primary-500/40 to-accent-500/30 blur-2xl absolute inset-0" />
              <div className="relative text-[11rem] leading-none select-none">💃</div>
            </div>
            <p className="text-center text-white/80 text-lg font-heading mt-6 max-w-sm">
              Découvrez des milliers de couples, femmes et hommes, et faites-vous de nouvelles
              relations
            </p>
          </div>

          {/* Formulaire d'inscription — carte blanche comme Libertic */}
          <div className="bg-white text-slate-900 rounded-2xl shadow-deep p-6 md:p-8 max-w-md w-full mx-auto">
            <h3 className="text-2xl font-bold font-heading text-primary-700 text-center mb-1">
              Inscription gratuite
            </h3>
            <p className="text-center text-[11px] font-bold tracking-wider text-slate-500 mb-6">
              SITE RÉSERVÉ AUX ADULTES
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Vous êtes... */}
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full !bg-white !text-slate-900"
              >
                <option value="">Vous êtes...</option>
                <option value="femme">Je suis une femme</option>
                <option value="couple">Nous sommes un couple</option>
                <option value="homme">Je suis un homme</option>
              </select>

              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Pseudo"
                minLength={4}
                maxLength={16}
                required
                className="w-full !bg-white !text-slate-900"
              />
              <p className="text-[10px] text-slate-400 -mt-2 pl-1">4 à 16 car.</p>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                minLength={8}
                maxLength={16}
                required
                className="w-full !bg-white !text-slate-900"
              />
              <p className="text-[10px] text-slate-400 -mt-2 pl-1">8 à 16 car.</p>

              <select
                value={pays}
                onChange={(e) => setPays(e.target.value)}
                required
                className="w-full !bg-white !text-slate-900"
              >
                <option value="">Choisissez le pays...</option>
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Suisse">Suisse</option>
                <option value="Monaco">Monaco</option>
              </select>

              <label className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                <input
                  type="checkbox"
                  checked={major}
                  onChange={(e) => setMajor(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Je certifie être majeur(e) et avoir lu et accepté les{' '}
                  <Link href="/cgv" className="text-primary-600 underline">
                    conditions générales de services
                  </Link>
                  .
                </span>
              </label>

              <label className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                <input
                  type="checkbox"
                  checked={rgpd}
                  onChange={(e) => setRgpd(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  En soumettant ce formulaire, j&apos;accepte que les informations saisies
                  soient exploitées dans le cadre de mon inscription, conformément à la{' '}
                  <Link href="/privacite" className="text-primary-600 underline">
                    politique de confidentialité
                  </Link>{' '}
                  du site.
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold font-heading rounded-xl hover:shadow-elevated transition-shadow text-lg tracking-wide"
              >
                J&apos;EN PROFITE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Séparateur en vague vers la section blanche */}
      <svg viewBox="0 0 1440 80" className="w-full block" preserveAspectRatio="none">
        <path
          d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z"
          className="fill-white dark:fill-slate-900"
        />
      </svg>
    </section>
  )
}
