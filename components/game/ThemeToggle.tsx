'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import React from 'react';
import { type Theme, useTheme } from '@/components/ThemeProvider';

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="space-y-3">
      <legend className="abyss-kicker flex items-center gap-2">
        <Sun className="w-3 h-3" aria-hidden="true" />
        Appearance
      </legend>
      <div className="abyss-segment" role="radiogroup" aria-label="Theme preference">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setTheme(value)}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
