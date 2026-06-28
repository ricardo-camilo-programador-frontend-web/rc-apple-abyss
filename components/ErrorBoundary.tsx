'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { motion } from 'motion/react';

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
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-red-50 to-stone-50 dark:from-stone-900 dark:via-red-950/30 dark:to-stone-900 p-4"
        >
          <div className="max-w-md w-full bg-white dark:bg-stone-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto"
              >
                <AlertTriangle className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mt-4">Oops! Something went wrong</h1>
              <p className="text-white/80 mt-2">The apple encountered an unexpected error</p>
            </div>

            <div className="p-6 space-y-4">
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-stone-50 dark:bg-stone-900 dark:border-stone-700 rounded-xl p-4 border border-stone-200">
                  <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 mb-2">
                    <Bug className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Error Details</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-mono break-all">
                    {error.message}
                  </p>
                </div>
              )}

              {errorCount >= 3 && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    Multiple errors detected. Try refreshing the page or clearing your browser data.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={this.handleReset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </motion.button>

                <motion.button
                  onClick={this.handleReload}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600 dark:text-stone-200 rounded-xl font-medium transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </motion.button>

                <motion.button
                  onClick={this.handleGoHome}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600 dark:text-stone-200 rounded-xl font-medium transition-all"
                >
                  <Home className="w-4 h-4" />
                  Go to Home
                </motion.button>
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
