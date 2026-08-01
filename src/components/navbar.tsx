'use client'

import React from 'react'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const dashboardRoutes = ['/decouvrir', '/groupes', '/groupe', '/chat', '/profil', '/abonnements']

const links = [
  { href: '/decouvrir', label: 'Découvrir' },
  { href: '/groupes', label: 'Groupes' },
  { href: '/abonnements', label: 'Abonnements' },
]

export const Navbar = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Na homepage o hero é escuro e o cabeçalho funde-se com ele.
  // Nas páginas de fundo claro, um bloco aubergine sólido lê-se como
  // uma faixa estranha colada por cima — aí o cabeçalho passa a claro.
  const sobreHero = pathname === '/'

  // Nas páginas do painel a navegação é do layout dedicado
  if (dashboardRoutes.some((r) => pathname.startsWith(r))) {
    return null
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        sobreHero
          ? 'bg-secondary-900/80 backdrop-blur-md text-white border-white/10'
          : 'bg-white/90 backdrop-blur-md text-slate-900 border-slate-200 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-800'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Marca: o nome é o logótipo, sem emblema a repeti-lo */}
          <Link
            href="/"
            className="font-display text-xl md:text-2xl tracking-tight transition-opacity hover:opacity-80 font-bold"
          >
            <span className={sobreHero ? 'text-white' : 'text-slate-900 dark:text-white'}>
              Libertinelover
            </span>
          </Link>

          {/* Navegação, com indicação da página actual */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
            {links.map((l) => {
              const active = pathname.startsWith(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`text-sm h-16 flex items-center border-b-2 -mb-px transition-colors ${
                    active
                      ? 'border-primary-500'
                      : sobreHero
                        ? 'border-transparent text-white/70 hover:text-white'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          {/* Uma só acção destacada */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className={`text-sm transition-colors ${
                sobreHero
                  ? 'text-white/80 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Créer un compte
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 -mr-2"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div
            className={`md:hidden pb-5 border-t ${
              sobreHero ? 'border-white/10' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <nav className="flex flex-col pt-2" aria-label="Navigation principale">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setIsOpen(false)}
                  className={`py-3 transition-colors ${
                    sobreHero
                      ? 'text-white/80 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div
              className={`flex items-center gap-3 pt-3 border-t ${
                sobreHero ? 'border-white/10' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`flex-1 py-2.5 text-center text-sm rounded-lg border ${
                  sobreHero
                    ? 'text-white/80 border-white/20'
                    : 'text-slate-700 border-slate-300 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 text-center text-sm font-semibold bg-primary-600 text-white rounded-lg"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
})
