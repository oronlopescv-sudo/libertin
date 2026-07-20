'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const dashboardRoutes = ['/decouvrir', '/groupes', '/groupe', '/chat', '/profil', '/abonnements']

const links = [
  { href: '/pratiques', label: 'Glossaire du libertinage' },
  { href: '/rencontre-libertine', label: 'Rencontres par ville' },
  { href: '/cgv', label: 'Conditions générales de services' },
  { href: '/privacite', label: 'Politique de confidentialité' },
  { href: '/mentions-legales', label: 'Mentions légales' },
]

export function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  if (dashboardRoutes.some((r) => pathname.startsWith(r))) return null

  return (
    <footer className="bg-secondary-900 text-slate-300 py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
        {/* Liens en ligne séparés par | — format Libertic */}
        <nav className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 text-xs mb-6">
          {links.map((l, i) => (
            <span key={l.href} className="flex items-center gap-2">
              <Link href={l.href} className="hover:text-primary-300 transition-colors">
                {l.label}
              </Link>
              {i < links.length - 1 && <span className="text-slate-600">|</span>}
            </span>
          ))}
        </nav>

        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
          Copyright © 2026-{currentYear} — RencontresPremium.fr est une marque déposée ·
          Reproduction interdite sans autorisation · Site réservé aux adultes 18+
        </p>

        {/* Paiement sécurisé — comme le bandeau CB Visa Mastercard de Libertic */}
        <div className="flex justify-center items-center gap-2">
          <span className="text-[10px] text-slate-500">Paiement sécurisé</span>
          <span className="bg-white text-[9px] font-bold text-blue-800 px-2 py-0.5 rounded">VISA</span>
          <span className="bg-white text-[9px] font-bold text-red-600 px-2 py-0.5 rounded">Mastercard</span>
          <span className="bg-white text-[9px] font-bold text-indigo-700 px-2 py-0.5 rounded">Stripe</span>
        </div>
      </div>
    </footer>
  )
}
