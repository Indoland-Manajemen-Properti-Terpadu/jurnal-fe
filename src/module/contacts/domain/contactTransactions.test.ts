import { describe, expect, it } from 'vitest';
import type { Sale } from '@/module/sales';
import {
  filterSalesByStatus,
  getInitials,
  isSaleOverdue,
  resolveSaleJournalId,
  summarizeSales,
} from './contactTransactions';

const now = new Date('2025-06-01T00:00:00.000Z').getTime();
const sale = (overrides: Partial<Sale>) =>
  ({ id: 'x', status: 'DRAFT', remainingAmount: 0, paidAmount: 0, ...overrides }) as Sale;

describe('isSaleOverdue', () => {
  it('needs money outstanding and a past due date', () => {
    expect(isSaleOverdue(sale({ remainingAmount: 1, dueDate: '2025-05-31' }), now)).toBe(true);
    expect(isSaleOverdue(sale({ remainingAmount: 1, dueDate: '2025-06-02' }), now)).toBe(false);
    expect(isSaleOverdue(sale({ remainingAmount: 0, dueDate: '2025-05-31' }), now)).toBe(false);
    expect(isSaleOverdue(sale({ remainingAmount: 1 }), now)).toBe(false);
  });
});

describe('filterSalesByStatus', () => {
  const sales = [
    sale({ id: 'a', status: 'paid' as never, paidAmount: 5 }),
    sale({ id: 'b', status: 'DRAFT', remainingAmount: 9, dueDate: '2025-01-01' }),
    sale({ id: 'c', status: 'SENT', remainingAmount: 9, dueDate: '2025-12-01' }),
  ];

  it('normalizes status case and keeps drafts out of unpaid', () => {
    expect(filterSalesByStatus(sales, 'PAID', now).map((s) => s.id)).toEqual(['a']);
    expect(filterSalesByStatus(sales, 'UNPAID', now).map((s) => s.id)).toEqual(['c']);
    expect(filterSalesByStatus(sales, 'DRAFT', now).map((s) => s.id)).toEqual(['b']);
    expect(filterSalesByStatus(sales, 'OVERDUE', now).map((s) => s.id)).toEqual(['b']);
    expect(filterSalesByStatus(sales, 'all', now)).toHaveLength(3);
  });
});

describe('summarizeSales', () => {
  it('sums whole rupiah as before', () => {
    expect(
      summarizeSales([
        sale({ finalAmount: 1500000, paidAmount: 500000, remainingAmount: 1000000 }),
        sale({ finalAmount: 250000, paidAmount: 0, remainingAmount: 250000 }),
      ])
    ).toEqual({ finalSum: 1750000, paidSum: 500000, remainingSum: 1250000 });
  });

  it('does not drift on decimal amounts', () => {
    const totals = summarizeSales([
      sale({ finalAmount: 0.1, paidAmount: 0.1, remainingAmount: 0.1 }),
      sale({ finalAmount: 0.2, paidAmount: 0.2, remainingAmount: 0.2 }),
    ]);
    expect(totals).toEqual({ finalSum: 0.3, paidSum: 0.3, remainingSum: 0.3 });
  });

  it('treats missing amounts as zero', () => {
    expect(summarizeSales([sale({ finalAmount: undefined as never })]).finalSum).toBe(0);
  });
});

describe('getInitials', () => {
  it('uses the first and last word, two letters for a single word', () => {
    expect(getInitials('Budi Santoso Putra')).toBe('BP');
    expect(getInitials('maju')).toBe('MA');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('resolveSaleJournalId', () => {
  it('prefers an item journal, then the invoice journal, then the transaction id', () => {
    const items = [{ journalTransaction: null }, { journalTransaction: 'j-item' }] as Sale['items'];
    expect(resolveSaleJournalId(sale({ items, journalId: 'j-sale' }))).toBe('j-item');
    expect(resolveSaleJournalId(sale({ items: [], journalId: 'j-sale', transactionId: 't' }))).toBe(
      'j-sale'
    );
    expect(resolveSaleJournalId(sale({ items: [], transactionId: 't' }))).toBe('t');
    expect(resolveSaleJournalId(sale({ items: [] }))).toBeUndefined();
  });
});
