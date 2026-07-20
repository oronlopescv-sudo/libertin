'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

const dashboardRoutes = ['/decouvrir', '/groupes', '/groupe', '/chat', '/profil', '/abonnements']

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    })
    if (result?.ok) router.push('/decouvrir')
    else router.push('/login')
  }

  // Sur les pages du dashboard, la navigation est gérée par le layout dédié
  if (dashboardRoutes.some((r) => pathname.startsWith(r))) {
    return null
  }

  return (
    <nav className="sticky top-0 w-full bg-white dark:bg-slate-900 shadow-md z-50">
      {/* Barre de connexion rapide — format Libertic */}
      <div className="hidden md:block bg-secondary-900 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-1.5 flex justify-end items-center gap-3 text-xs">
          <span className="text-white/70">Déjà membre ?</span>
          <form onSubmit={handleQuickLogin} className="flex items-center gap-2">
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              className="!py-1 !px-2.5 !text-xs !rounded-md !bg-white/10 !border-white/20 !text-white placeholder:!text-white/50 w-36"
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Mot de passe"
              className="!py-1 !px-2.5 !text-xs !rounded-md !bg-white/10 !border-white/20 !text-white placeholder:!text-white/50 w-36"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-primary-600 hover:bg-primary-500 rounded-md font-bold transition-colors"
            >
              Connexion
            </button>
          </form>
          <Link href="/forgot-password" className="text-white/60 hover:text-white underline">
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RP</span>
            </div>
            <span className="hidden md:block font-bold font-heading text-lg text-primary-900 dark:text-primary-200">
              RencontresPremium
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/decouvrir" className="text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors">
              Découvrir
            </Link>
            <Link href="/groupes" className="text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors">
              Groupes
            </Link>
            <Link href="/abonnements" className="text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors">
              Abonnements
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow"
            >
              Rejoindre
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-4">
              <Link href="/decouvrir" className="text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors">
                Découvrir
              </Link>
              <Link href="/groupes" className="text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors">
                Groupes
              </Link>
              <Link href="/abonnements" className="text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors">
                Abonnements
              </Link>
              <hr className="border-slate-200 dark:border-slate-700" />
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Connexion
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-lg text-center"
              >
                Rejoindre
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
