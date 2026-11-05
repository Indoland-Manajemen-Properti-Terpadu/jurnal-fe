import { percentOf } from './reportFormat';
import type { GeneralLedgerAccount, GeneralLedgerTransaction } from './generalLedger.types';

export interface BalancePoint {
  /** `yyyy-mm-dd` */
  date: string;
  balance: number;
}

export interface MovementBucket {
  /** `yyyy-mm-dd` for a day, `yyyy-mm` for a month. */
  key: string;
  debit: number;
  credit: number;
}

export type MovementGranularity = 'day' | 'month';

const dayOf = (value: string): string => value.slice(0, 10);

/** Running balance of an account: the opening balance, then the last balance of every day that had movement. */
export const buildBalanceSeries = (
  openingBalance: number,
  startDate: string,
  transactions: GeneralLedgerTransaction[]
): BalancePoint[] => {
  const lastOfDay = new Map<string, number>();
  [...transactions]
    .filter((tx) => tx.transactionDate)
    .sort((a, b) => a.transactionDate.localeCompare(b.transactionDate))
    .forEach((tx) => lastOfDay.set(dayOf(tx.transactionDate), tx.balance));

  return [
    { date: dayOf(startDate), balance: openingBalance },
    ...[...lastOfDay.entries()].map(([date, balance]) => ({ date, balance })),
  ];
};

/** Months once the period is longer than two months; days otherwise. */
export const pickGranularity = (startDate: string, endDate: string): MovementGranularity => {
  const days = (Date.parse(endDate) - Date.parse(startDate)) / 86_400_000;
  return days > 62 ? 'month' : 'day';
};

/** Debit and credit of an account grouped by day or month, oldest first. */
export const groupMovement = (
  transactions: GeneralLedgerTransaction[],
  granularity: MovementGranularity
): MovementBucket[] => {
  const buckets = new Map<string, MovementBucket>();
  transactions.forEach((tx) => {
    if (!tx.transactionDate) return;
    const key =
      granularity === 'month' ? tx.transactionDate.slice(0, 7) : dayOf(tx.transactionDate);
    const bucket = buckets.get(key) ?? { key, debit: 0, credit: 0 };
    bucket.debit += tx.debit;
    bucket.credit += tx.credit;
    buckets.set(key, bucket);
  });
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
};

/**
 * Movement of the accounts on a page per day or month. Parent accounts are left out because their
 * movement already includes their sub accounts.
 */
export const groupAccountsMovement = (
  accounts: GeneralLedgerAccount[],
  granularity: MovementGranularity
): MovementBucket[] =>
  groupMovement(
    accounts.filter((account) => !account.isHead).flatMap((account) => account.transactions),
    granularity
  );

export { percentOf };
