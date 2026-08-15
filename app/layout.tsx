import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
  title: 'xlibertine - Rencontres Libertines, Couples & Célibataires',
  description: 'La plateforme française de référence pour rencontres libertines. Couples, célibataires, profils vérifiés, discrétion absolue et communauté 100% francophone.',
  openGraph: {
    title: 'xlibertine - Site Libertine Premium',
    description: 'Rencontres libertines vérifiées, soirées privées, tchat en temps réel et communauté bienveillante.',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'xlibertine - Rencontres Libertines',
    description: 'Rencontres libertines vérifiées, soirées privées, tchat en temps réel et communauté bienveillante.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body suppressHydrationWarning className="bg-[#12091A] text-[#F5F0F8] antialiased selection:bg-[#D4145A] selection:text-white min-h-screen flex flex-col">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}


