'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/components/ThemeProvider';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-bold uppercase text-stone-400 flex items-center gap-2">
        <Sun className="w-3 h-3" />
        Appearance
      </legend>
      <div
        className="flex rounded-xl border border-stone-200 overflow-hidden"
        role="radiogroup"
        aria-label="Theme preference"
      >
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              role="radio"
              aria-checked={isActive}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-400 ${
                isActive
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
