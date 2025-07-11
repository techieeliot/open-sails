'use client';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ReactNode, ErrorInfo } from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="error-boundary">
      <div className="error-boundary-fallback">
        <h2>Something went wrong</h2>
        <p>We&apos;re sorry, but something unexpected happened.</p>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    </div>
  );
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export default function ErrorBoundary({ children, fallback, onError }: Props) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Error caught by boundary:', error, errorInfo);

    // Custom error handler
    onError?.(error, errorInfo);

    // Here you could send to your error tracking service
    // For example: trackError(error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
