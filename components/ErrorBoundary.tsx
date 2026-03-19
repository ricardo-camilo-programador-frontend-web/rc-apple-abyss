'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
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

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Could send to error tracking service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-red-50 to-stone-50 p-4"
        >
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
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
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <div className="flex items-center gap-2 text-stone-500 mb-2">
                    <Bug className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Error Details</span>
                  </div>
                  <p className="text-sm text-red-600 font-mono break-all">
                    {error.message}
                  </p>
                </div>
              )}

              {errorCount >= 3 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
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
                  className="flex items-center justify-center gap-2 w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </motion.button>

                <motion.button
                  onClick={this.handleGoHome}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-all"
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

  const showBoundary = (error: Error) => {
    setError(() => {
      throw error;
    });
  };

  return { showBoundary };
}
