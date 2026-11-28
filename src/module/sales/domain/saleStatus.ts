import type { SaleDisplayCode, SaleExtraFilter, SaleListParams } from './sale';
import { toCents } from './saleMoney';

export const SALE_TABS = ['draft', 'issued', 'void'] as const;
export type SaleTab = (typeof SALE_TABS)[number];

/** What the Terbit tab lists: every invoice that was issued and not cancelled. */
export const SENT_STATUSES: SaleDisplayCode[] = ['UNPAID', 'PAID', 'OVERDUE'];

/** Status choices inside the Terbit tab; the draft and cancelled tabs have none. */
export const SENT_STATUS_FILTERS: SaleStatusFilter[] = [
  'OPEN',
  'UNPAID',
  'OVERDUE',
  'PAID',
  'PARTIAL_PAID',
  'RETURNED',
];

/** OPEN combines unpaid and overdue invoices; it is a list filter, never an API status or badge. */
export type SaleStatusFilter = SaleDisplayCode | SaleExtraFilter | 'OPEN';

/** List query for a tab and an optional status filter ("all" = no extra filter). */
export const tabParams = (
  tab: SaleTab,
  status: SaleStatusFilter | 'all'
): Pick<SaleListParams, 'paymentStatus'> => {
  if (tab === 'draft') return { paymentStatus: 'DRAFT' };
  if (tab === 'void') return { paymentStatus: 'VOID' };
  if (status === 'OPEN') return { paymentStatus: ['UNPAID', 'OVERDUE'] };
  return { paymentStatus: status === 'all' ? SENT_STATUSES : status };
};

/** What the badges of an invoice say: its state, and whether a payment covers only part of it. */
export interface SaleBadges {
  /**
   * Payment state stays visible even after a return. An unpaid invoice with a payment on it reads
   * "Dibayar sebagian" alone, since "Belum lunas" next to it says the same twice.
   */
  main: SaleDisplayCode | 'PARTIAL';
  returned: 'partial' | 'full' | 'unknown' | null;
  partialPaid: boolean;
}

const returnExtent = (sale: {
  hasReturn?: boolean;
  items?: readonly { quantity: number; returnedQty?: number }[];
  finalAmount?: number;
  returnedAmount?: number;
}): SaleBadges['returned'] => {
  if (!sale.hasReturn) return null;

  const items = sale.items ?? [];
  if (items.some((item) => (item.returnedQty ?? 0) > 0)) {
    return items.every((item) => item.quantity > 0 && (item.returnedQty ?? 0) >= item.quantity)
      ? 'full'
      : 'partial';
  }

  if (sale.returnedAmount != null && toCents(sale.returnedAmount) > 0 && sale.finalAmount != null) {
    return toCents(sale.finalAmount) > 0 ? 'partial' : 'full';
  }

  return 'unknown';
};

export const saleBadges = (sale: {
  displayStatus: { code: SaleDisplayCode };
  hasReturn?: boolean;
  isPartiallyPaid?: boolean;
  items?: readonly { quantity: number; returnedQty?: number }[];
  finalAmount?: number;
  returnedAmount?: number;
}): SaleBadges => {
  const { code } = sale.displayStatus;
  const issued = code !== 'DRAFT' && code !== 'VOID';
  // Paid in full or void is never "partly paid", whatever the flag says.
  const partial = Boolean(sale.isPartiallyPaid) && (code === 'UNPAID' || code === 'OVERDUE');
  const returned = issued ? returnExtent(sale) : null;
  if (partial && code === 'UNPAID') return { main: 'PARTIAL', returned, partialPaid: false };
  return { main: code, returned, partialPaid: partial };
};

export type SaleStatusTone = { color: string; variant: 'light' | 'filled' | 'outline' };

/** Red only for real lateness and green only for paid; everything else stays neutral or brand. */
export const saleStatusTone = (code: SaleDisplayCode | 'RETURNED' | 'PARTIAL'): SaleStatusTone => {
  switch (code) {
    case 'PARTIAL':
      return { color: 'blue', variant: 'outline' };
    case 'RETURNED':
      return { color: 'orange', variant: 'light' };
    case 'OVERDUE':
      return { color: 'red', variant: 'light' };
    case 'PAID':
      return { color: 'green', variant: 'light' };
    case 'UNPAID':
      return { color: 'primary', variant: 'light' };
    case 'VOID':
      return { color: 'gray', variant: 'outline' };
    case 'DRAFT':
    default:
      return { color: 'gray', variant: 'light' };
  }
};

export type TimelineStep = {
  key: 'draft' | 'sent' | 'paid' | 'void';
  state: 'done' | 'current' | 'todo';
};

/** Where an invoice is on its way from draft to paid; void is a dead end of its own. */
export const saleTimeline = (code: SaleDisplayCode): TimelineStep[] => {
  switch (code) {
    case 'DRAFT':
      return [
        { key: 'draft', state: 'current' },
        { key: 'sent', state: 'todo' },
        { key: 'paid', state: 'todo' },
      ];
    case 'PAID':
      return [
        { key: 'draft', state: 'done' },
        { key: 'sent', state: 'done' },
        { key: 'paid', state: 'done' },
      ];
    case 'VOID':
      return [
        { key: 'draft', state: 'done' },
        { key: 'void', state: 'current' },
      ];
    default:
      return [
        { key: 'draft', state: 'done' },
        { key: 'sent', state: 'current' },
        { key: 'paid', state: 'todo' },
      ];
  }
};
