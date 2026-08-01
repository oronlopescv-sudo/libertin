'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const HeroSection = React.memo(() {
  const router = useRouter()
  const [stats, setStats] = useState({ femmesCouplesPct: 78.0, hommesPct: 22.0 })
  const [gender, setGender] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [pays, setPays] = useState('')
  const [major, setMajor] = useState(false)
  const [rgpd, setRgpd] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = useCallback((e: React.FormEvent) => {
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
    <section className="bg-secondary-900 text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-14">
        {/* Título: o diferenciador dito em primeiro lugar */}
        <div className="max-w-3xl mb-8">
          <p className="t-eyebrow text-accent-300 mb-3">
            Réservé aux adultes · France, Belgique, Suisse
          </p>
          <h1 className="t-display mb-4">
            Ici, les femmes et les couples sont majoritaires.
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl">
            C&apos;est pourquoi leur inscription et leur accès restent entièrement
            gratuits.
          </p>
        </div>

        {/* Barra de proporção: a largura de cada segmento é a percentagem real */}
        <div className="max-w-3xl mb-12">
          <div
            className="ratio-bar"
            role="img"
            aria-label={`${stats.femmesCouplesPct} % de femmes et couples, ${stats.hommesPct} % d'hommes`}
          >
            <div
              className="ratio-major"
              style={{ flexBasis: `${stats.femmesCouplesPct}%` }}
            >
              <span className="ratio-figure">
                {stats.femmesCouplesPct.toLocaleString('fr-FR', {
                  minimumFractionDigits: 1,
                })}
                %
              </span>
              <span className="ratio-label">Femmes et couples</span>
            </div>
            <div
              className="ratio-minor"
              style={{ flexBasis: `${stats.hommesPct}%` }}
            >
              <span className="ratio-figure">
                {stats.hommesPct.toLocaleString('fr-FR', {
                  minimumFractionDigits: 1,
                })}
                %
              </span>
              <span className="ratio-label">Hommes</span>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3 capitalize">
            Répartition des membres actifs au {today}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:items-start">
          <div className="hidden lg:block">
            <p className="t-eyebrow text-white/40 mb-4">Comment ça marche</p>
            <ol className="space-y-5 text-white/75 max-w-sm">
              <li className="flex gap-3">
                <span className="font-display text-accent-300 text-xl leading-none">1</span>
                <span>Créez votre profil en une minute, sans carte bancaire.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-display text-accent-300 text-xl leading-none">2</span>
                <span>Parcourez les profils actifs près de chez vous.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-display text-accent-300 text-xl leading-none">3</span>
                <span>Échangez en privé ou rejoignez un groupe de discussion.</span>
              </li>
            </ol>
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

              <button aria-label="Action"
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold font-heading rounded-xl hover:shadow-elevated transition-shadow text-lg tracking-wide"
              >
                J&apos;EN PROFITE
              </button>
            </form>
          </div>
        </div>
      </div>

    </section>
  )
}
