'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemPreference();
  return theme;
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/** Read the initial resolved theme from the DOM (set by the anti-FOUC script in layout.tsx) */
function getInitialResolvedTheme(): 'light' | 'dark' {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getInitialResolvedTheme);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Theme preference could not be saved:', e);
    }
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  useEffect(() => {
    // Read saved preference
    let savedTheme: Theme = 'system';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        savedTheme = stored;
      }
    } catch (e) {
      console.warn('Theme preference could not be read:', e);
    }

    setThemeState(savedTheme);
    const resolved = resolveTheme(savedTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Listen for system preference changes (only re-resolves when theme === 'system')
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeRef.current !== 'system') return;
      const newResolved = getSystemPreference();
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const contextValue = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
