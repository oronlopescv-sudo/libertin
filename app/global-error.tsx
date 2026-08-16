'use client';

/**
 * Dernier filet de sécurité, au niveau racine.
 *
 * Contrairement à ErrorBoundary (qui vit à l'intérieur du layout), ce
 * fichier remplace tout le document quand l'erreur survient AVANT que le
 * layout ne soit monté — c'est exactement le cas qui produit l'écran
 * « Application error » sans aucune indication de cause.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#12091A',
          color: '#F5F0F8',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Une erreur est survenue
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            La page n&apos;a pas pu s&apos;afficher. Vous pouvez recharger la page.
          </p>

          <button
            onClick={() => reset()}
            style={{
              padding: '0.7rem 1.4rem',
              background: '#D4145A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Recharger
          </button>

          <pre
            style={{
              marginTop: '2rem',
              padding: '0.9rem',
              background: '#1C102B',
              border: '1px solid #2C1B3D',
              borderRadius: 8,
              fontSize: '0.72rem',
              color: '#a1a1aa',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {error.message}
            {error.digest ? `\n\ndigest: ${error.digest}` : ''}
          </pre>
        </div>
      </body>
    </html>
  );
}
