import { describe, expect, it } from 'vitest';
import type { OpeningRow } from './beginningBalance';
import { groupOpeningRows } from './openingGroups';

const row = (id: string, accountNumber: string, over: Partial<OpeningRow> = {}): OpeningRow => ({
  id,
  name: id,
  accountNumber,
  normalSide: 'debit',
  isContra: false,
  debit: 0,
  credit: 0,
  ...over,
});

describe('groupOpeningRows', () => {
  it('groups by the first digit of the code, in class order, keeping row order', () => {
    const groups = groupOpeningRows([
      row('modal', '3-10000'),
      row('kas', '1-10001'),
      row('bank', '1-10003'),
      row('utang', '2-10000'),
    ]);
    expect(groups.map((group) => group.accountClass)).toEqual([1, 2, 3]);
    expect(groups[0].rows.map((r) => r.id)).toEqual(['kas', 'bank']);
  });

  it('leaves out classes without rows and puts an unknown code last', () => {
    const groups = groupOpeningRows([row('x', 'ZZ-1'), row('kas', '1-10001')]);
    expect(groups.map((group) => group.accountClass)).toEqual([1, null]);
  });

  it('returns nothing for no rows', () => {
    expect(groupOpeningRows([])).toEqual([]);
  });
});
