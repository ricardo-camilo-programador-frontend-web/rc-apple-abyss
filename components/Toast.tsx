'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        return updated.slice(-maxToasts);
      });

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [maxToasts, removeToast]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: 'success', title, message }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast({ type: 'error', title, message }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons: Record<ToastType, React.ElementType> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: 'text-green-500' },
    error: { bg: 'from-red-50 to-rose-50', border: 'border-red-200', icon: 'text-red-500' },
    warning: { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', icon: 'text-yellow-500' },
    info: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', icon: 'text-blue-500' },
  };

  const Icon = icons[toast.type];
  const color = colors[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`pointer-events-auto bg-gradient-to-r ${color.bg} border ${color.border} rounded-xl shadow-lg overflow-hidden`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`shrink-0 ${color.icon}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-900 text-sm">{toast.title}</p>
          {toast.message && (
            <p className="text-stone-600 text-xs mt-1 leading-relaxed">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                onClose();
              }}
              className="text-xs font-bold text-red-500 hover:text-red-600 mt-2 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Standalone toast for use outside React tree
let toastFunction: ((toast: Omit<Toast, 'id'>) => string) | null = null;

export function setToastFunction(fn: (toast: Omit<Toast, 'id'>) => string) {
  toastFunction = fn;
}

export function toast(toast: Omit<Toast, 'id'>) {
  if (!toastFunction) {
    console.warn('Toast system not initialized. Wrap your app with ToastProvider.');
    return '';
  }
  return toastFunction(toast);
}
