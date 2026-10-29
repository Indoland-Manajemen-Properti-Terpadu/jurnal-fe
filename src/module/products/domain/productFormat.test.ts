import { formatDate, formatPrice } from './productFormat';

const NBSP = ' ';

describe('formatPrice', () => {
  it('formats whole rupiah without decimals', () => {
    expect(formatPrice(2500000)).toBe(`Rp${NBSP}2.500.000`);
    expect(formatPrice(0)).toBe(`Rp${NBSP}0`);
  });

  it('keeps up to two decimals and drops a trailing zero decimal', () => {
    expect(formatPrice(1500.5)).toBe(`Rp${NBSP}1.500,5`);
    expect(formatPrice(1500.55)).toBe(`Rp${NBSP}1.500,55`);
  });

  it('rounds sub-cent values to two decimals for display only', () => {
    expect(formatPrice(10.999)).toBe(`Rp${NBSP}11`);
  });

  it('shows a dash when the price is missing', () => {
    expect(formatPrice(null)).toBe('—');
  });
});

describe('formatDate', () => {
  it('formats an ISO date in the Indonesian short style', () => {
    expect(formatDate('2026-03-05T10:00:00.000Z')).toBe('5 Mar 2026');
  });

  it('shows a dash for missing or invalid dates', () => {
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
  });
});
