import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import type { Sale } from '@/module/sales';

export type TransactionStatusFilter = 'all' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'DRAFT';

export const TRANSACTION_STATUS_FILTERS: readonly TransactionStatusFilter[] = [
  'all',
  'UNPAID',
  'PAID',
  'OVERDUE',
  'DRAFT',
];

/** An invoice with money outstanding and a due date in the past. */
export const isSaleOverdue = (sale: Sale, now: number = Date.now()): boolean =>
  (sale.remainingAmount ?? 0) > 0 &&
  Boolean(sale.dueDate) &&
  new Date(sale.dueDate!).getTime() < now;

/**
 * Client-side filter: the API only knows real statuses, so calculated states such as
 * OVERDUE and a missing or lower-case status are resolved here.
 */
export const filterSalesByStatus = (
  sales: Sale[],
  status: TransactionStatusFilter,
  now: number = Date.now()
): Sale[] =>
  sales.filter((sale) => {
    const normalized = String(sale.status || 'DRAFT').toUpperCase();
    const remaining = sale.remainingAmount ?? 0;
    if (status === 'OVERDUE') return isSaleOverdue(sale, now);
    if (status === 'UNPAID') {
      return (
        normalized === 'UNPAID' ||
        normalized === 'OPEN' ||
        normalized === 'PARTIAL' ||
        (remaining > 0 && normalized !== 'DRAFT')
      );
    }
    if (status === 'PAID') {
      return normalized === 'PAID' || (remaining <= 0 && (sale.paidAmount ?? 0) > 0);
    }
    if (status === 'DRAFT') return normalized === 'DRAFT';
    return true;
  });

export type SalesTotals = { finalSum: number; paidSum: number; remainingSum: number };

/** Sums in integer minor units so decimal amounts do not drift. */
export const summarizeSales = (sales: Sale[]): SalesTotals => {
  const sum = (pick: (sale: Sale) => number | undefined) =>
    Number(fromMinor(sumMinor(sales.map((sale) => toMinor(pick(sale) || 0)))));

  return {
    finalSum: sum((sale) => sale.finalAmount),
    paidSum: sum((sale) => sale.paidAmount),
    remainingSum: sum((sale) => sale.remainingAmount),
  };
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** The journal an invoice posted to: the first item's journal, then the invoice's own ids. */
export const resolveSaleJournalId = (sale: Sale): string | null | undefined => {
  const itemWithJournal = sale.items?.find((item) => Boolean(item.journalTransaction));
  return itemWithJournal?.journalTransaction || sale.journalId || sale.transactionId;
};
