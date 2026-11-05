import type { SaleDisplayCode, SaleListParams } from './sale';

export const SALE_TABS = ['draft', 'sent'] as const;
export type SaleTab = (typeof SALE_TABS)[number];

/** Payment states a sent invoice can show; void has no tab. */
export const SENT_STATUSES: SaleDisplayCode[] = ['UNPAID', 'PAID', 'OVERDUE'];

/** Status choices inside a tab: the draft tab has none, the sent tab filters further. */
export const SENT_STATUS_FILTERS: SaleDisplayCode[] = ['UNPAID', 'OVERDUE', 'PAID'];

/** List query for a tab and an optional status filter ("all" = no extra filter). */
export const tabParams = (
  tab: SaleTab,
  status: SaleDisplayCode | 'all'
): Pick<SaleListParams, 'paymentStatus'> => {
  if (tab === 'draft') return { paymentStatus: 'DRAFT' };
  return { paymentStatus: status === 'all' ? SENT_STATUSES : status };
};

export type SaleStatusTone = { color: string; variant: 'light' | 'filled' | 'outline' };

/** Red only for real lateness and green only for paid; everything else stays neutral or brand. */
export const saleStatusTone = (code: SaleDisplayCode): SaleStatusTone => {
  switch (code) {
    case 'OVERDUE':
      return { color: 'red', variant: 'light' };
    case 'PAID':
      return { color: 'teal', variant: 'light' };
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
