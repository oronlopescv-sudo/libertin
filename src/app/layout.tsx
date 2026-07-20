import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'RencontresPremium.fr - Rencontres Libertines entre Couples',
  description: 'Site de rencontres premium pour couples et libertins. Discrétion garantie. Chat privé sécurisé.',
  keywords: 'rencontre, libertine, couple, adulte, chat privé, France',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'RencontresPremium.fr - Rencontres Libertines',
    description: 'Plateforme premium de rencontres libertines avec discrétion garantie.',
    type: 'website',
    url: 'https://rencontres-premium.fr',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-body">
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
