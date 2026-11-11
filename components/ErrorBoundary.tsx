'use client';

import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    const normalized = error instanceof Error ? error : new Error(String(error));
    return { hasError: true, error: normalized };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // Log error in all environments
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Could send to error tracking service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  override render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Render prop pattern: fallback can be a function receiving error and reset
      if (typeof fallback === 'function') {
        try {
          const result = fallback(error!, this.handleReset);
          if (result !== undefined) return result as React.ReactElement;
        } catch (fallbackError) {
          // If custom fallback throws, fall through to default UI
          console.error('ErrorBoundary fallback threw:', fallbackError);
        }
      } else if (fallback) {
        return fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: 'var(--bg)', color: 'var(--ink)' }}
        >
          <div className="abyss-modal max-w-md">
            <div className="abyss-modal-body text-center space-y-4">
              <div className="abyss-card-icon w-16 h-16 mx-auto rounded-full">
                <AlertTriangle className="w-8 h-8" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
              <p style={{ color: 'var(--muted)' }}>The apple encountered an unexpected error</p>

              {process.env.NODE_ENV === 'development' && error && (
                <div className="abyss-error text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="w-4 h-4" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase">Error Details</span>
                  </div>
                  <p className="text-sm font-mono break-all">{error.message}</p>
                </div>
              )}

              {errorCount >= 3 && (
                <div className="abyss-callout text-left" role="status">
                  <p className="text-sm">
                    Multiple errors detected. Try refreshing the page or clearing your browser data.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="abyss-btn abyss-btn-apple"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="abyss-btn abyss-btn-ghost"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Reload Page
                </button>
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="abyss-btn abyss-btn-ghost"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return children;
  }
}

// Hook to use error boundary
export function useErrorBoundary() {
  const [, setError] = React.useState<Error | null>(null);

  const showBoundary = React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);

  return { showBoundary };
}
