import { fromMinor, sumMinor } from '@/lib/money/money';
import type { JournalEntryByAccount } from './journalEntry';

type Row = Pick<
  JournalEntryByAccount,
  'id' | 'transactionDate' | 'transactionNumber' | 'createdAt' | 'debit' | 'credit'
>;

const toCents = (value: unknown): number => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(Number((amount * 100).toPrecision(15))) : 0;
};

const time = (value: Date | string | undefined): number => {
  const parsed = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const chronological = (a: Row, b: Row): number =>
  time(a.transactionDate) - time(b.transactionDate) ||
  (Number(a.transactionNumber) || 0) - (Number(b.transactionNumber) || 0) ||
  time(a.createdAt) - time(b.createdAt);

/**
 * Running balance of a debit-normal account (cash and bank): the net of every row (debit minus
 * credit) added up in date order, then number order. The server's own `balance` is not used, it
 * does not net a row that carries both sides. Rows keep their incoming order in the result.
 */
export const withRunningBalance = <T extends Row>(
  entries: readonly T[]
): Array<T & { balance: number }> => {
  const balances = new Map<string, number>();
  const net: number[] = [];
  [...entries].sort(chronological).forEach((entry) => {
    net.push(toCents(entry.debit) - toCents(entry.credit));
    balances.set(entry.id, Number(fromMinor(sumMinor(net))));
  });
  return entries.map((entry) => ({ ...entry, balance: balances.get(entry.id) ?? 0 }));
};
