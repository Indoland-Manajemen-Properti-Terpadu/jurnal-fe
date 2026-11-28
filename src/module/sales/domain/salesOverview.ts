export type SalesOverviewActionType = 'quote' | 'order' | 'sale';
export type SalesOverviewUrgency = 'stale' | 'warn' | 'ok';

export interface SalesOverviewAction {
  type: SalesOverviewActionType;
  title: string;
  id: string;
  number: string;
  customer: string;
  ageDays: number;
  urgency: SalesOverviewUrgency;
  detail: string;
  amount: number | null;
}

export interface SalesOverview {
  asOf: string;
  precision: number;
  receivables: {
    amount: number;
    count: number;
    futureCount: number;
    overdueCount: number;
    overdue: number;
    next7Days: number;
    later: number;
  };
  unsentInvoices: {
    count: number;
    amount: number;
  };
  aging: {
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    over90: number;
  };
  customers: Array<{
    id: string;
    name: string;
    amount: number;
    count: number;
    overdueCount: number;
    share: number;
  }>;
  actionCounts: {
    all: number;
    stale: number;
    warn: number;
    ok: number;
  };
  actions: SalesOverviewAction[];
  workflow: {
    quotes: number;
    orders: number;
    drafts: number;
    invoices: number;
  };
  cash: {
    amount: number;
    count: number;
  };
  credit: {
    amount: number;
    count: number;
  };
  monthly: {
    current: number;
    previousComparable: number;
    previousFull: number;
    invoiceCount: number;
  };
  quotes: {
    accepted: number;
    rejected: number;
    expired: number;
    awaiting: number;
    awaitingAmount: number;
    /** Percentage on a 0–100 scale. */
    conversionRate: number;
  };
}
