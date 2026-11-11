'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useCallback, useEffect, useId, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function Modal({ isOpen, onClose, title, children, wide = false }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (firstFocusable || dialogRef.current)?.focus();
      }, 50);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        clearTimeout(timer);
        triggerRef.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          className="abyss-backdrop"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduceMotion ? false : { scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { scale: 0.96, y: 12 }}
            className={`abyss-modal ${wide ? 'abyss-modal-wide' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="abyss-modal-head">
              <h2 id={titleId} className="font-bold text-lg">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="abyss-close"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="abyss-modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
