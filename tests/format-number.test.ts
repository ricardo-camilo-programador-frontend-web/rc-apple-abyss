import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NOTATION,
  formatFull,
  formatNumber,
  isNumberNotation,
  NUMBER_NOTATIONS,
} from '@/lib/game/format';

const en = { locale: 'en' } as const;

describe('formatNumber — misto (padrão)', () => {
  it('usa Misto como padrão', () => {
    expect(DEFAULT_NOTATION).toBe('mixed');
    expect(NUMBER_NOTATIONS).toEqual(['mixed', 'letters', 'scientific', 'engineering']);
  });

  it('formata zero e valores pequenos como inteiros', () => {
    expect(formatNumber(0, en)).toBe('0');
    expect(formatNumber(5, en)).toBe('5');
    expect(formatNumber(999, en)).toBe('999');
  });

  it('trunca abaixo de 1000 em vez de arredondar para 1000', () => {
    expect(formatNumber(999.95, en)).toBe('999');
    expect(formatNumber(999.95, { ...en, decimals: 1 })).toBe('999.9');
    expect(formatNumber(12.345, { ...en, decimals: 1 })).toBe('12.3');
  });

  it('mostra decimais pedidos abaixo de 1000', () => {
    expect(formatNumber(885.4, { ...en, decimals: 1 })).toBe('885.4');
    expect(formatNumber(0.5, { ...en, decimals: 1 })).toBe('0.5');
  });

  it('formata negativos com sinal', () => {
    expect(formatNumber(-5, en)).toBe('-5');
    expect(formatNumber(-1500, en)).toBe('-1.50K');
    expect(formatNumber(-1.6e67, en)).toBe('-1.60e67');
  });

  it('usa sufixos K…Dc', () => {
    expect(formatNumber(1000, en)).toBe('1.00K');
    expect(formatNumber(5313, en)).toBe('5.31K');
    expect(formatNumber(1e6, en)).toBe('1.00M');
    expect(formatNumber(1e9, en)).toBe('1.00B');
    expect(formatNumber(1e12, en)).toBe('1.00T');
    expect(formatNumber(1e15, en)).toBe('1.00Qa');
    expect(formatNumber(4.179e32, en)).toBe('417.90No');
    expect(formatNumber(1e33, en)).toBe('1.00Dc');
  });

  it('faz a virada de sufixo no arredondamento (999,995K → 1,00M)', () => {
    expect(formatNumber(999_950, en)).toBe('999.95K');
    expect(formatNumber(999_995, en)).toBe('1.00M');
    expect(formatNumber(999_999, en)).toBe('1.00M');
  });

  it('troca para científica em 1e36', () => {
    expect(formatNumber(999.99e33, en)).toBe('999.99Dc');
    expect(formatNumber(999.999e33, en)).toBe('1.00e36');
    expect(formatNumber(1e36, en)).toBe('1.00e36');
    expect(formatNumber(1.6029440842264702e67, en)).toBe('1.60e67');
  });

  it('formata 1e308 e o teto do Number', () => {
    expect(formatNumber(1e308, en)).toBe('1.00e308');
    expect(formatNumber(Number.MAX_VALUE, en)).toBe('1.80e308');
  });

  it('trata Infinity e NaN', () => {
    expect(formatNumber(Infinity, en)).toBe('∞');
    expect(formatNumber(-Infinity, en)).toBe('-∞');
    expect(formatNumber(NaN, en)).toBe('—');
  });

  it('nunca passa de 10 caracteres em todo o intervalo do Number', () => {
    for (let e = 0; e <= 308; e++) {
      for (const notation of NUMBER_NOTATIONS) {
        const out = formatNumber(9.99999 * 10 ** Math.min(e, 307), { ...en, notation });
        expect(out.length).toBeLessThanOrEqual(10);
      }
    }
  });
});

describe('formatNumber — outras notações', () => {
  it('Letras: K/M/B/T e depois aa, ab…', () => {
    const o = { ...en, notation: 'letters' as const };
    expect(formatNumber(1500, o)).toBe('1.50K');
    expect(formatNumber(1e12, o)).toBe('1.00T');
    expect(formatNumber(1e15, o)).toBe('1.00aa');
    expect(formatNumber(1e18, o)).toBe('1.00ab');
    expect(formatNumber(1e93, o)).toBe('1.00ba');
    expect(formatNumber(999_995, o)).toBe('1.00M');
  });

  it('Científica', () => {
    const o = { ...en, notation: 'scientific' as const };
    expect(formatNumber(999, o)).toBe('999');
    expect(formatNumber(1000, o)).toBe('1.00e3');
    expect(formatNumber(9.995e5, o)).toBe('1.00e6');
    expect(formatNumber(1.6029e67, o)).toBe('1.60e67');
  });

  it('Engenharia', () => {
    const o = { ...en, notation: 'engineering' as const };
    expect(formatNumber(1000, o)).toBe('1.00e3');
    expect(formatNumber(1.6029e67, o)).toBe('16.03e66');
    expect(formatNumber(999.996e3, o)).toBe('1.00e6');
  });
});

describe('formatNumber — idioma', () => {
  it('usa o separador decimal do idioma do jogo com algarismos latinos', () => {
    expect(formatNumber(1500, { locale: 'pt' })).toBe('1,50K');
    expect(formatNumber(1.6e67, { locale: 'de' })).toBe('1,60e67');
    expect(formatNumber(1500, { locale: 'ar' })).toMatch(/^1.50K$/);
    expect(formatNumber(999, { locale: 'pt' })).toBe('999');
  });
});

describe('formatFull', () => {
  it('mostra todos os dígitos até 1e15 e científica longa depois', () => {
    expect(formatFull(5313, 'en')).toBe('5,313');
    expect(formatFull(123456789012, 'pt')).toBe('123.456.789.012');
    expect(formatFull(1.6029440842264702e67, 'en')).toBe('1.602944e67');
    expect(formatFull(Infinity, 'en')).toBe('∞');
    expect(formatFull(NaN, 'en')).toBe('—');
  });
});

describe('isNumberNotation', () => {
  it('valida valores vindos do save', () => {
    expect(isNumberNotation('mixed')).toBe(true);
    expect(isNumberNotation('letters')).toBe(true);
    expect(isNumberNotation('foo')).toBe(false);
    expect(isNumberNotation(undefined)).toBe(false);
  });
});
