import type { SaleDisplayCode, SaleExtraFilter, SaleListParams } from './sale';

export const SALE_TABS = ['draft', 'issued', 'void'] as const;
export type SaleTab = (typeof SALE_TABS)[number];

/** What the Terbit tab lists: every invoice that was issued and not cancelled. */
export const SENT_STATUSES: SaleDisplayCode[] = ['UNPAID', 'PAID', 'OVERDUE'];

/** Status choices inside the Terbit tab; the draft and cancelled tabs have none. */
export const SENT_STATUS_FILTERS: SaleStatusFilter[] = [
  'UNPAID',
  'OVERDUE',
  'PAID',
  'PARTIAL_PAID',
  'RETURNED',
];

/** One choice of the status filter. The last two only narrow the list; they are not badges. */
export type SaleStatusFilter = SaleDisplayCode | SaleExtraFilter;

/** List query for a tab and an optional status filter ("all" = no extra filter). */
export const tabParams = (
  tab: SaleTab,
  status: SaleStatusFilter | 'all'
): Pick<SaleListParams, 'paymentStatus'> => {
  if (tab === 'draft') return { paymentStatus: 'DRAFT' };
  if (tab === 'void') return { paymentStatus: 'VOID' };
  return { paymentStatus: status === 'all' ? SENT_STATUSES : status };
};

/** What the badges of an invoice say: its state, and whether a payment covers only part of it. */
export interface SaleBadges {
  /**
   * A returned invoice reads "Diretur"; an unpaid one with a payment on it reads "Dibayar
   * sebagian" alone, since "Belum lunas" next to it says the same twice; otherwise the server's own state.
   */
  main: SaleDisplayCode | 'RETURNED' | 'PARTIAL';
  partialPaid: boolean;
}

export const saleBadges = (sale: {
  displayStatus: { code: SaleDisplayCode };
  hasReturn?: boolean;
  isPartiallyPaid?: boolean;
}): SaleBadges => {
  const { code } = sale.displayStatus;
  const issued = code !== 'DRAFT' && code !== 'VOID';
  // Paid in full or void is never "partly paid", whatever the flag says.
  const partial = Boolean(sale.isPartiallyPaid) && (code === 'UNPAID' || code === 'OVERDUE');
  if (issued && sale.hasReturn) return { main: 'RETURNED', partialPaid: partial };
  if (partial && code === 'UNPAID') return { main: 'PARTIAL', partialPaid: false };
  return { main: code, partialPaid: partial };
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
