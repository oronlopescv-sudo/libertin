'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for catching and displaying React errors
 * Usage: Wrap components that might throw
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service (Sentry, LogRocket, etc.)
    console.error('Error caught by boundary:', error, errorInfo);

    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry or similar
      // captureException(error, { contexts: { react: errorInfo } });
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#12091A] text-[#F5F0F8] px-4">
          <div className="max-w-md w-full space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-800/50 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-bold text-white">Quelque chose s&apos;est mal passé</h1>
              <p className="text-sm text-zinc-400">
                Une erreur est survenue lors de l&apos;affichage de cette page.
                Vous pouvez réessayer, ou revenir à l&apos;accueil.
              </p>
            </div>

            {/* Détail technique — replié par défaut, mais disponible aussi en
                production : sans lui, un utilisateur qui rencontre l'erreur ne
                peut rien rapporter d'exploitable, et la cause reste invisible. */}
            {this.state.error && (
              <details className="p-3 bg-[#1C102B] border border-red-800/30 rounded-lg">
                <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-300 select-none">
                  Détail technique
                </summary>
                <p className="mt-2 text-xs text-red-400 font-mono break-words whitespace-pre-wrap max-h-48 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
                </p>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 py-3 px-4 rounded-lg bg-[#D4145A] text-white font-bold text-sm hover:bg-[#B50E4A] transition-colors flex items-center justify-center gap-2"
              >
                <span>Réessayer</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/"
                className="flex-1 py-3 px-4 rounded-lg border border-[#3D2654] text-white font-bold text-sm hover:bg-[#2C1B3D] transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </Link>
            </div>

            {/* Help Text */}
            <div className="text-center text-xs text-zinc-500">
              Si le problème persiste, contactez{' '}
              <a href="mailto:support@xlibertine.com" className="text-[#E86B7A] hover:underline">
                support@xlibertine.com
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
