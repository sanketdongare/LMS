'use client';

/**
 * Global Error Boundary – required for Next.js 16 + Turbopack.
 * Without this file, Turbopack cannot locate the built-in
 * `global-error.js` module in the React Client Manifest, which
 * causes a runtime crash on every page load.
 *
 * This component wraps the entire app (including the root layout),
 * so it must ship its own <html> / <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: '"Inter", "Roboto", "Helvetica", Arial, sans-serif',
          color: '#f1f5f9',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem',
            maxWidth: 480,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(8,145,178,0.25)',
            borderRadius: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: 28,
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              color: '#f1f5f9',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: '0.9rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              lineHeight: 1.7,
            }}
          >
            An unexpected error occurred in the application.
          </p>

          {error?.digest && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#475569',
                marginBottom: '1.5rem',
                fontFamily: 'monospace',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.65rem 1.75rem',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #0891b2, #0d9488)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(8,145,178,0.35)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.opacity = '0.85')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.opacity = '1')}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
