'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';
import {
  DEFAULT_NOTATION,
  type FormatOptions,
  type Formattable,
  formatFull,
  formatNumber,
  type NumberNotation,
} from '@/lib/game/format';

interface NumberFormatSettings {
  notation: NumberNotation;
  locale: string;
}

const NumberFormatContext = createContext<NumberFormatSettings>({
  notation: DEFAULT_NOTATION,
  locale: 'en',
});

export function NumberFormatProvider({
  notation,
  locale,
  children,
}: NumberFormatSettings & { children: ReactNode }) {
  const value = useMemo(() => ({ notation, locale }), [notation, locale]);
  return <NumberFormatContext.Provider value={value}>{children}</NumberFormatContext.Provider>;
}

/** Formata com a notação e o idioma escolhidos pelo jogador. */
export function useNumberFormat() {
  const settings = useContext(NumberFormatContext);
  return useMemo(
    () => ({
      ...settings,
      format: (value: Formattable, options?: Omit<FormatOptions, 'notation' | 'locale'>) =>
        formatNumber(value, { ...settings, ...options }),
      full: (value: Formattable) => formatFull(value, settings.locale),
    }),
    [settings],
  );
}
