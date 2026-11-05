import { describe, expect, it } from 'vitest';
import { buildInvoiceLink, formatCompactIDR, formatCount, invoiceFilename } from './saleFormat';

describe('buildInvoiceLink', () => {
  it('joins the origin and the token under /invoice', () => {
    expect(buildInvoiceLink('https://app.example', 'abc')).toBe('https://app.example/invoice/abc');
  });

  it('ignores a trailing slash on the origin', () => {
    expect(buildInvoiceLink('https://app.example/', 'abc')).toBe('https://app.example/invoice/abc');
  });
});

describe('invoiceFilename', () => {
  it('replaces characters that are invalid in file names', () => {
    expect(invoiceFilename('INV/001')).toBe('Faktur-INV_001.pdf');
  });
});

describe('formatCompactIDR', () => {
  it('writes millions, billions and trillions in words', () => {
    expect(formatCompactIDR(2_100_000)).toBe('Rp 2,1 jt');
    expect(formatCompactIDR(7_346_699_078)).toBe('Rp 7,3 miliar');
    expect(formatCompactIDR(2_500_000_000_000)).toBe('Rp 2,5 triliun');
  });

  it('moves to the next unit when rounding reaches a thousand', () => {
    expect(formatCompactIDR(999_960_000)).toBe('Rp 1 miliar');
    expect(formatCompactIDR(999_940_000)).toBe('Rp 999,9 jt');
  });

  it('writes small amounts in full', () => {
    expect(formatCompactIDR(0).replace(/\s/g, ' ')).toBe('Rp 0');
    expect(formatCompactIDR(null)).toBe('Rp 0');
    expect(formatCompactIDR(950_000)).toContain('950.000');
  });
});

describe('formatCount', () => {
  it('separates thousands the Indonesian way', () => {
    expect(formatCount(3236)).toBe('3.236');
  });
});
