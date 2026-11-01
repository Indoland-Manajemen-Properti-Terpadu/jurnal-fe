import { formatDateTime, formatIDR } from './pendingChangeFormat';

describe('formatIDR', () => {
  it('formats whole and decimal amounts with two decimals', () => {
    expect(formatIDR(2500000)).toBe('Rp 2.500.000,00');
    expect(formatIDR(1500.5)).toBe('Rp 1.500,50');
    expect(formatIDR('1500.5')).toBe('Rp 1.500,50');
  });

  it('returns zero for empty, zero and unparsable values', () => {
    expect(formatIDR(undefined)).toBe('Rp 0');
    expect(formatIDR(null)).toBe('Rp 0');
    expect(formatIDR(0)).toBe('Rp 0');
    expect(formatIDR('abc')).toBe('Rp 0');
  });
});

describe('formatDateTime', () => {
  it('returns a dash for a missing date', () => {
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDateTime(null, 'en')).toBe('—');
  });

  it('formats in the language of the user', () => {
    expect(formatDateTime('2026-05-10T12:00:00Z', 'id')).toMatch(/10 Mei 2026/);
    expect(formatDateTime('2026-05-10T12:00:00Z', 'en')).toMatch(/May 10, 2026/);
  });
});
