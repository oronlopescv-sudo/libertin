'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/decouvrir', label: 'Découvrir', icon: '🔍' },
  { href: '/groupes', label: 'Groupes', icon: '💬' },
  { href: '/profil', label: 'Mon profil', icon: '👤' },
  { href: '/abonnements', label: 'Abonnement', icon: '⭐' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isPremium =
    session?.user?.subscriptionEnd && new Date(session.user.subscriptionEnd) > new Date()
  const isFreeAccess =
    session?.user?.gender === 'femme' || session?.user?.gender === 'couple'
  const hasAccess = isPremium || isFreeAccess

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
      {/* Bandeau Premium */}
      {!hasAccess && (
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center text-sm py-2 px-4">
          <Link href="/abonnements" className="hover:underline">
            🔓 Passez Premium pour voir les profils et accéder au chat — dès 2,08€/mois
          </Link>
        </div>
      )}

      {/* Nav desktop (barre latérale visible md+) */}
      <div className="flex">
        <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 sticky top-0">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">RP</span>
            </div>
            <span className="font-bold font-heading text-primary-900 dark:text-primary-100">
              RencontresPremium
            </span>
          </Link>

          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {session?.user?.name ?? 'Utilisateur'}
            </p>
            <p className="text-xs mb-3">
              {isPremium ? (
                <span className="text-primary-600 font-semibold">⭐ Premium actif</span>
              ) : isFreeAccess ? (
                <span className="text-green-600 font-semibold">✓ Accès complet gratuit</span>
              ) : (
                <span className="text-slate-500">Compte gratuit</span>
              )}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-500 hover:text-danger transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Nav mobile (barre en bas) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-2 z-40">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs',
              pathname.startsWith(item.href)
                ? 'text-primary-600 font-semibold'
                : 'text-slate-500'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
