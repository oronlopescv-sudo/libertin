import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'LibertineLovers - Rencontres Libertines, Casais & Solteiros',
  description: 'Le site de rencontres libertines n°1 pour couples et célibataires exigeants en France. Discrétion absolue, profils vérifiés et clubs privés.',
  openGraph: {
    title: 'LibertineLovers - Site Libertin Premium',
    description: 'Rencontres libertines vérifiées, soirées privées, tchat en temps réel et communauté bienveillante.',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body suppressHydrationWarning className="bg-[#12091A] text-[#F5F0F8] antialiased selection:bg-[#D4145A] selection:text-white min-h-screen flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


