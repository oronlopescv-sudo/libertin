import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'LIBERTINESEX - Rencontres Libertines entre Couples',
  description: 'LIBERTINESEX - Site de rencontres premium pour couples et libertins. Discrétion garantie. Chat privé sécurisé.',
  keywords: 'libertinesex, rencontre, libertine, couple, adulte, chat privé, France',
  openGraph: {
    title: 'LIBERTINESEX - Rencontres Libertines',
    description: 'LIBERTINESEX - Plateforme premium de rencontres libertines avec discrétion garantie.',
    type: 'website',
    url: 'https://green-toad-192382.hostingersite.com',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
