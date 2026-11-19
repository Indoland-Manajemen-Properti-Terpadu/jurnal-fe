import { describe, expect, it } from 'vitest';
import { saleBadges } from './saleStatus';

const sale = (code: 'DRAFT' | 'UNPAID' | 'OVERDUE' | 'PAID' | 'VOID', extra = {}) => ({
  displayStatus: { code },
  ...extra,
});

describe('saleBadges', () => {
  it('reads "returned" for an issued invoice with a return', () => {
    expect(saleBadges(sale('UNPAID', { hasReturn: true })).main).toBe('RETURNED');
    expect(saleBadges(sale('PAID', { hasReturn: true })).main).toBe('RETURNED');
  });

  it('keeps the server state without a return, and for drafts and void ones', () => {
    expect(saleBadges(sale('OVERDUE')).main).toBe('OVERDUE');
    expect(saleBadges(sale('VOID', { hasReturn: true })).main).toBe('VOID');
    expect(saleBadges(sale('DRAFT', { hasReturn: true })).main).toBe('DRAFT');
  });

  it('adds "partly paid" only while the invoice is still open', () => {
    expect(saleBadges(sale('UNPAID', { isPartiallyPaid: true })).partialPaid).toBe(true);
    expect(saleBadges(sale('OVERDUE', { isPartiallyPaid: true })).partialPaid).toBe(true);
    expect(saleBadges(sale('PAID', { isPartiallyPaid: true })).partialPaid).toBe(false);
    expect(saleBadges(sale('UNPAID')).partialPaid).toBe(false);
  });
});
