import { describe, expect, it } from 'vitest';
import { formatAmountAt, formatMoneyAt, toDecimalPrecision } from './formatMoney';

const norm = (s: string) => s.replace(/\s/g, ' ');

describe('formatMoneyAt', () => {
  it('always shows every digit of the precision', () => {
    expect(norm(formatMoneyAt(6641802026, 2))).toBe('Rp 6.641.802.026,00');
    expect(norm(formatMoneyAt(6641802026, 3))).toBe('Rp 6.641.802.026,000');
    expect(norm(formatMoneyAt(6641802026, 4))).toBe('Rp 6.641.802.026,0000');
    expect(norm(formatMoneyAt(35000000, 0))).toBe('Rp 35.000.000');
  });

  it('falls back to 2 digits for an unknown precision', () => {
    expect(toDecimalPrecision(undefined)).toBe(2);
    expect(toDecimalPrecision(7)).toBe(2);
    expect(norm(formatMoneyAt(1, 7))).toBe('Rp 1,00');
  });
});

describe('formatAmountAt', () => {
  it('has no currency sign and keeps negatives', () => {
    expect(formatAmountAt(-2500.5, 2)).toBe('-2.500,50');
  });
});
