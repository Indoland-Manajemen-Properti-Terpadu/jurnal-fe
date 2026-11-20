import { describe, expect, it } from 'vitest';
import {
  SENT_STATUS_FILTERS,
  saleBadges,
  saleStatusTone,
  saleTimeline,
  tabParams,
} from './saleStatus';

describe('tabParams', () => {
  it('lists void on its own tab, never among the issued statuses', () => {
    expect(SENT_STATUS_FILTERS).not.toContain('VOID');
    expect(tabParams('void', 'all')).toEqual({ paymentStatus: 'VOID' });
    expect(tabParams('issued', 'all').paymentStatus).not.toContain('VOID');
  });

  it('asks only for drafts on the draft tab', () => {
    expect(tabParams('draft', 'all')).toEqual({ paymentStatus: 'DRAFT' });
  });

  it('lists every sent status (and leaves void out) when no status is chosen', () => {
    expect(tabParams('issued', 'all')).toEqual({ paymentStatus: ['UNPAID', 'PAID', 'OVERDUE'] });
  });

  it('uses the chosen status exactly', () => {
    expect(tabParams('issued', 'OVERDUE')).toEqual({ paymentStatus: 'OVERDUE' });
  });
});

describe('saleStatusTone', () => {
  it('keeps red for overdue and green for paid only', () => {
    expect(saleStatusTone('OVERDUE').color).toBe('red');
    expect(saleStatusTone('PAID').color).toBe('green');
    expect(saleStatusTone('UNPAID').color).toBe('primary');
    expect(saleStatusTone('DRAFT').color).toBe('gray');
    expect(saleStatusTone('VOID').color).toBe('gray');
  });
});

describe('status filters', () => {
  it('offers partly paid and returned next to the states, and asks for them by name', () => {
    expect(SENT_STATUS_FILTERS).toContain('PARTIAL_PAID');
    expect(SENT_STATUS_FILTERS).toContain('RETURNED');
    expect(tabParams('issued', 'PARTIAL_PAID')).toEqual({ paymentStatus: 'PARTIAL_PAID' });
    expect(tabParams('issued', 'RETURNED')).toEqual({ paymentStatus: 'RETURNED' });
  });
});

describe('saleTimeline', () => {
  const states = (code: Parameters<typeof saleTimeline>[0]) =>
    saleTimeline(code).map((step) => `${step.key}:${step.state}`);

  it('shows a draft as the first step of three', () => {
    expect(states('DRAFT')).toEqual(['draft:current', 'sent:todo', 'paid:todo']);
  });

  it('keeps an unpaid or overdue invoice on the sent step', () => {
    expect(states('UNPAID')).toEqual(['draft:done', 'sent:current', 'paid:todo']);
    expect(states('OVERDUE')).toEqual(['draft:done', 'sent:current', 'paid:todo']);
  });

  it('completes every step for a paid invoice', () => {
    expect(states('PAID')).toEqual(['draft:done', 'sent:done', 'paid:done']);
  });

  it('ends a void invoice on the void step', () => {
    expect(states('VOID')).toEqual(['draft:done', 'void:current']);
  });
});

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
    expect(saleBadges(sale('OVERDUE', { isPartiallyPaid: true })).partialPaid).toBe(true);
    expect(saleBadges(sale('PAID', { isPartiallyPaid: true })).partialPaid).toBe(false);
    expect(saleBadges(sale('UNPAID')).partialPaid).toBe(false);
  });

  it('shows an unpaid invoice with a payment as "partly paid" alone, not twice', () => {
    expect(saleBadges(sale('UNPAID', { isPartiallyPaid: true }))).toEqual({
      main: 'PARTIAL',
      partialPaid: false,
    });
  });

  it('keeps both badges when the partly paid invoice is overdue or returned', () => {
    expect(saleBadges(sale('OVERDUE', { isPartiallyPaid: true }))).toEqual({
      main: 'OVERDUE',
      partialPaid: true,
    });
    expect(saleBadges(sale('UNPAID', { isPartiallyPaid: true, hasReturn: true }))).toEqual({
      main: 'RETURNED',
      partialPaid: true,
    });
  });
});
