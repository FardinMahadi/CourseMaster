'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global application error:', error);
    }

    // In production, you could log to an error reporting service
    // Example: logErrorToService(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl font-bold">Application Error</h1>
            <p className="text-muted-foreground">
              A critical error occurred. Please refresh the page or contact support if the problem
              persists.
            </p>
            {error.digest && (
              <p className="text-sm text-muted-foreground">Error ID: {error.digest}</p>
            )}
            {process.env.NODE_ENV === 'development' && error.stack && (
              <pre className="mt-4 max-w-full overflow-auto rounded bg-muted p-4 text-left text-xs">
                {error.stack}
              </pre>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 border rounded-md hover:bg-accent"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
