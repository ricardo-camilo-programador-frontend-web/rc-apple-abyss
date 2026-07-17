'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({ 
  title, 
  icon: Icon, 
  color, 
  children, 
  defaultOpen = true 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 rounded-lg ${colors.bg} ${colors.border} border transition-all hover:shadow-sm`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colors.text}`} />
          <span className={`font-semibold text-sm ${colors.text}`}>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className={`w-4 h-4 ${colors.text}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${colors.text}`} />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
