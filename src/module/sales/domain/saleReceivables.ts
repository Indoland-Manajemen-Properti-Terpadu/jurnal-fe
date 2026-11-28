import { sumMinor } from '@/lib/money/money';
import type { ReceivablesSummary } from './sale';
import { fromCents, toCents } from './saleMoney';

const DAY_MS = 86_400_000;

/** Whole calendar days from a due date to today. Due dates are UTC midnight of the calendar day. */
const calendarDaysSince = (dueIso: string, now: number): number => {
  const today = new Date(now);
  const due = new Date(dueIso);
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  return Math.max(0, Math.round((todayDay - dueDay) / DAY_MS));
};

/**
 * A part's share of a whole as text: a floored whole percent, "<1" for a sliver, "100" only for
 * the whole itself, null when there is no whole. Compared in cents.
 */
export const shareLabel = (part: number, whole: number): string | null => {
  const partCents = toCents(part);
  const wholeCents = toCents(whole);
  if (wholeCents <= 0) return null;
  if (partCents >= wholeCents) return '100';
  const percent = (partCents / wholeCents) * 100;
  if (percent <= 0) return '0';
  if (percent < 1) return '<1';
  return String(Math.floor(percent));
};

export type ReceivablePartKey = 'received' | 'notDue' | 'overdue';

export interface ReceivablePart {
  key: ReceivablePartKey;
  amount: number;
  /** Invoices in this part; the summary does not count received payments, so that one is null. */
  count: number | null;
  shareLabel: string | null;
}

export interface ReceivablesView {
  /** Final amount of every sent invoice: received + not yet due + overdue. */
  billedAmount: number;
  outstandingAmount: number;
  outstandingCount: number;
  /** The three parts of what was billed, in the order the bar draws them. */
  parts: ReceivablePart[];
  /** Whole calendar days since the oldest overdue invoice fell due; null when nothing is overdue. */
  oldestOverdueDays: number | null;
  isEmpty: boolean;
}

/**
 * One equation instead of three cards: what was billed splits into what came in, what is not due
 * yet and what is late. Every amount appears once; shares are of the sum the bar draws.
 */
export const buildReceivablesView = (summary: ReceivablesSummary, now: number): ReceivablesView => {
  const received = toCents(summary.received);
  const notDue = toCents(summary.notDue.amount);
  const overdue = toCents(summary.overdue.amount);
  const whole = fromCents(sumMinor([received, notDue, overdue]));

  const part = (key: ReceivablePartKey, cents: number, count: number | null): ReceivablePart => ({
    key,
    amount: fromCents(cents),
    count,
    shareLabel: shareLabel(fromCents(cents), whole),
  });
  const parts = [
    part('received', received, null),
    part('notDue', notDue, summary.notDue.count),
    part('overdue', overdue, summary.overdue.count),
  ];

  return {
    billedAmount: summary.billed,
    outstandingAmount: fromCents(sumMinor([notDue, overdue])),
    outstandingCount: summary.notDue.count + summary.overdue.count,
    parts,
    oldestOverdueDays:
      summary.overdue.count > 0 && summary.overdue.oldestDueDate
        ? calendarDaysSince(summary.overdue.oldestDueDate, now)
        : null,
    isEmpty: toCents(summary.billed) <= 0 && sumMinor([received, notDue, overdue]) <= 0,
  };
};

/** Whole percent of one invoice already paid, 0..100; 100 only once it is paid in full. */
export const paidPercent = (finalAmount: number, paidAmount: number): number => {
  const total = toCents(finalAmount);
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.floor((toCents(paidAmount) / total) * 100)));
};

export type ReceivableAgingKey = 'current' | 'days1to30' | 'days31to60' | 'days61to90' | 'over90';
export type ReceivableAgingFilter = ReceivableAgingKey | 'overdue' | 'dueNext7';
export type ReceivableView = 'customers' | 'invoices';
export type ReceivableAgingAmount = { amount: number; count: number };
export type ReceivableAging = Record<ReceivableAgingKey, ReceivableAgingAmount>;

export type ReceivablesOverview = {
  asOf: string;
  precision: number;
  summary: {
    total: ReceivableAgingAmount;
    customerCount: number;
    overdue: ReceivableAgingAmount & { oldestDays: number };
    dueInSevenDays: ReceivableAgingAmount;
    customerCredit: { amount: number; customerCount: number };
  };
  aging: ReceivableAging;
  reconciliation: {
    asOf: string;
    invoiceBalance: number;
    invoiceCount: number;
    ledgerBalance: number;
    difference: number;
    status: 'MATCHED' | 'DIFFERENCE';
    accounts: { id: string; accountNumber: string; name: string }[];
    forward: { adjustment: number; invoiceCount: number | null };
    afterDate: Record<string, { count: number; amount: number; effect: number }>;
  };
};

export type ReceivableCustomerRow = {
  customer: { id: string; name: string; contactNumber: string };
  invoiceCount: number;
  total: number;
  credit: number;
  overdueCount: number;
  maxDaysOverdue: number;
  aging: ReceivableAging;
};

export type ReceivableInvoiceRow = {
  id: string;
  transactionNumber: string;
  customer: { id: string; name: string; contactNumber: string } | null;
  customerRefNumber: string;
  transactionDate: string | null;
  dueDate: string | null;
  daysPastDue: number;
  aging: ReceivableAgingKey;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  returnedAmount: number;
  creditAppliedAmount: number;
  outstandingLateFee: number;
  lastInvoiceEmailAt: string | null;
  canEmailInvoice: boolean;
  saleOrderId: string | null;
  status: string;
};

export type ReceivablesPage<T> = {
  data: T[];
  precision: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type ReceivableCustomerDetail = {
  precision: number;
  customer: {
    id: string;
    name: string;
    displayName: string;
    contactNumber: string;
    phoneNumber: string;
    emails: string[];
    address: string;
  };
  totalReceivable: number;
  creditAvailable: number;
  aging: ReceivableAging;
  invoices: {
    data: {
      id: string;
      transactionNumber: string;
      transactionDate: string | null;
      dueDate: string | null;
      finalAmount: number;
      paidAmount: number;
      remainingAmount: number;
      returnedAmount: number;
      lastInvoiceEmailAt: string | null;
      canEmailInvoice: boolean;
      saleOrderId: string | null;
      status: string;
    }[];
    pagination: { total: number; limit: number; hasMore: boolean };
  };
  payments: {
    id: string;
    invoiceId: string;
    invoiceNumber: string;
    transactionNumber: string;
    paymentDate: string | null;
    amount: number;
    memo: string;
  }[];
  upcomingOrders: {
    data: {
      id: string;
      transactionNumber: string;
      transactionDate: string | null;
      targetDate: string | null;
      status: string;
      total: number;
      [key: string]: unknown;
    }[];
    total: number;
  };
};

export type ReceivableListParams = {
  page: number;
  limit: number;
  search?: string;
  customer?: string;
  aging?: ReceivableAgingFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
