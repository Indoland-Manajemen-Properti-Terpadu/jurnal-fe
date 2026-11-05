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
