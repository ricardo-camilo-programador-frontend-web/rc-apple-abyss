'use client';

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  toasts: Array<Toast>;
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

// Static lookup maps hoisted to module scope to avoid per-render allocation
const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors: Record<ToastType, string> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const actionColors: Record<ToastType, string> = {
  success: 'var(--teal)',
  error: 'var(--danger)',
  warning: 'var(--gold)',
  info: 'var(--magic)',
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

// Maximum auto-dismiss delay to prevent setTimeout(fn, Infinity) which resolves immediately
const MAX_DURATION = 86_400_000; // 24 hours

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Array<Toast>>([]);
  // Track timeouts for cleanup on unmount and manual dismiss
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const mountedRef = useRef(true);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    mountedRef.current = true;
    const currentTimeouts = timeoutRefs.current;
    return () => {
      mountedRef.current = false;
      currentTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      currentTimeouts.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id);
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      // Guard against post-unmount invocation
      if (!mountedRef.current) return '';

      const id = crypto.randomUUID();
      const duration = toast.duration ?? 5000;
      const newToast: Toast = {
        ...toast,
        id,
        duration,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Clear timeouts for evicted toasts
        if (updated.length > maxToasts) {
          const evicted = updated.slice(0, updated.length - maxToasts);
          for (const t of evicted) {
            const evictedTimeout = timeoutRefs.current.get(t.id);
            if (evictedTimeout !== undefined) {
              clearTimeout(evictedTimeout);
              timeoutRefs.current.delete(t.id);
            }
          }
        }
        return updated.slice(-maxToasts);
      });

      // Only set auto-dismiss timer for finite positive durations (0 = no auto-dismiss)
      if (duration > 0 && Number.isFinite(duration)) {
        const safeDuration = Math.min(duration, MAX_DURATION);
        const timeout = setTimeout(() => {
          removeToast(id);
        }, safeDuration);
        timeoutRefs.current.set(id, timeout);
      }

      return id;
    },
    [maxToasts, removeToast],
  );

  const clearToasts = useCallback(() => {
    timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    setToasts([]);
  }, []);

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: 'success', title, message }),
    [addToast],
  );

  const error = useCallback(
    (title: string, message?: string) => addToast({ type: 'error', title, message }),
    [addToast],
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    [addToast],
  );

  const info = useCallback(
    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    [addToast],
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
  toasts: Array<Toast>;
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
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
  const Icon = toastIcons[toast.type];
  const color = toastColors[toast.type];
  const actionColor = actionColors[toast.type];

  return (
    <motion.div
      layout
      role="alert"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className="abyss-toast"
      data-tone={color}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="shrink-0" style={{ color: 'var(--ink)' }}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{toast.title}</p>
          {toast.message && (
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
              {toast.message}
            </p>
          )}
          {toast.action && (
            <button
              onClick={() => {
                try {
                  toast.action!.onClick();
                } finally {
                  onClose();
                }
              }}
              className="text-xs font-bold mt-2 min-h-11"
              style={{ color: actionColor }}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button onClick={onClose} className="abyss-close shrink-0" aria-label="Close notification">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
