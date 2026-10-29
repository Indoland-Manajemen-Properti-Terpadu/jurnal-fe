import { fromMinor, sumMinor } from '@/lib/money/money';

export interface AmountItem {
  amount?: number | null;
}

/** Rounds one amount half up to the cent, as the accounting kernel does for display. */
const toRoundedCents = (value: number): number => {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Invalid amount: ${String(value)}`);
  }
  return Math.round(Number((value * 100).toPrecision(15)));
};

/**
 * Sum of `amount` over the items, in whole cents: each amount is rounded half up to the cent,
 * the cents are added as integers, and a missing amount counts as zero. Returns the total in
 * currency units with at most two decimals.
 */
export const sumAmounts = (items: AmountItem[]): number =>
  Number(fromMinor(sumMinor(items.map((item) => toRoundedCents(item.amount || 0)))));

export const groupByCategory = <T extends { category?: { name?: string | null } | null }>(
  items: T[],
  fallback: string
): Record<string, T[]> =>
  items.reduce<Record<string, T[]>>((groups, item) => {
    const name = item.category?.name || fallback;
    (groups[name] ||= []).push(item);
    return groups;
  }, {});
