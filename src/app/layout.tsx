import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RencontresPremium - Rencontres Libertines',
  description: 'Le 1er réseau social libertinge en France',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <nav className="gradient-primary text-white sticky top-0 z-50">
          <div className="container flex justify-between items-center py-4">
            <a href="/" className="text-2xl font-bold hover:opacity-90">💋 RencontresPremium</a>
            <div className="flex gap-4 items-center">
              <a href="/discover" className="btn-small text-white hover:opacity-80">Découvrir</a>
              <a href="/abonnements" className="btn-small text-white hover:opacity-80">Premium</a>
              <a href="/login" className="btn-small text-white">Connexion</a>
              <a href="/register" className="btn-small text-white bg-white text-primary-500 px-4 py-2 rounded font-semibold hover:bg-gray-100">M'inscrire</a>
            </div>
          </div>
        </nav>

        <main>{children}</main>

        <footer className="bg-secondary-900 text-white py-8 text-center">
          <div className="container">
            <div className="mb-4 flex justify-center gap-6">
              <a href="#" className="hover:underline text-sm">Confidentialité</a>
              <a href="#" className="hover:underline text-sm">CGV</a>
              <a href="#" className="hover:underline text-sm">Contact</a>
            </div>
            <p className="text-sm opacity-75">&copy; 2026 RencontresPremium. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
