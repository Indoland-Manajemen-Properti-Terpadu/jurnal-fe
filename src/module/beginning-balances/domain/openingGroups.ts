import type { OpeningRow } from './beginningBalance';
import { accountClassOf } from './openingBalanceRules';

/** The accounts of one class (1 assets ... 8 other expenses). */
export interface OpeningGroup {
  /** First digit of the code; null for a code that does not start with 1 to 8. */
  accountClass: number | null;
  rows: OpeningRow[];
}

/**
 * Splits the rows by account class, in class order, keeping the order of the rows inside a class.
 * Classes with no row are left out.
 */
export const groupOpeningRows = (rows: OpeningRow[]): OpeningGroup[] => {
  const byClass = new Map<number | null, OpeningRow[]>();
  for (const row of rows) {
    const key = accountClassOf(row.accountNumber);
    byClass.set(key, [...(byClass.get(key) ?? []), row]);
  }
  return [...byClass.entries()]
    .sort(([a], [b]) => (a ?? 99) - (b ?? 99))
    .map(([accountClass, groupRows]) => ({ accountClass, rows: groupRows }));
};
