'use client';

import type { Formattable } from '@/lib/game/format';
import { useNumberFormat } from './NumberFormatProvider';

interface NumberTextProps {
  value: Formattable;
  /** Casas decimais abaixo de 1000 (ex.: DPS 885.4). */
  decimals?: number;
  className?: string;
}

/**
 * Número abreviado na tela, com o valor completo no tooltip (`title`) e no
 * texto lido pelo leitor de tela. Algarismos tabulares e sem quebra de linha.
 */
export default function NumberText({ value, decimals, className }: NumberTextProps) {
  const { format, full } = useNumberFormat();
  const short = format(value, { decimals });
  const complete = full(value);
  return (
    <span className={className ? `abyss-num ${className}` : 'abyss-num'} title={complete}>
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{complete}</span>
    </span>
  );
}
