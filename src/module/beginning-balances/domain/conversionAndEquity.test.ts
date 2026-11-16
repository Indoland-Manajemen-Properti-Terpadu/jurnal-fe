import { describe, expect, it } from 'vitest';
import type { OpeningRow, SimpleAccount } from './beginningBalance';
import {
  balanceToEquity,
  buildOpeningRows,
  buildConversionWindow,
  conversionDateIssue,
  countProfitLossFilled,
  findOpeningEquityRow,
  summarizeOpeningBalance,
} from './openingBalanceRules';

const row = (over: Partial<OpeningRow> = {}): OpeningRow => ({
  id: 'a1',
  name: 'Kas',
  accountNumber: '1-10000',
  normalSide: 'debit',
  isContra: false,
  debit: 0,
  credit: 0,
  ...over,
});

describe('conversionDateIssue with a closing', () => {
  it('refuses a day up to the end of the latest closing, even outside any lock', () => {
    expect(conversionDateIssue('2024-01-01', null, false, '2025-12-31')).toBe('beforeClosing');
    expect(conversionDateIssue('2025-12-31', null, false, '2025-12-31')).toBe('beforeClosing');
    expect(conversionDateIssue('2026-01-01', null, false, '2025-12-31')).toBeNull();
  });

  it('reports a lock before the closing rule', () => {
    expect(conversionDateIssue('2025-06-30', null, true, '2025-12-31')).toBe('locked');
  });
});

describe('buildConversionWindow', () => {
  const today = '2026-11-13';

  it('suggests today when the books have no journal and no closing', () => {
    expect(
      buildConversionWindow({ lastClosingEnd: null, firstTransactionDate: null, today })
    ).toEqual({
      earliest: null,
      latest: null,
      conflict: false,
      suggested: today,
    });
  });

  it('suggests the day before the first journal', () => {
    const window = buildConversionWindow({
      lastClosingEnd: null,
      firstTransactionDate: '2024-04-15T00:00:00.000Z',
      today,
    });
    expect(window.suggested).toBe('2024-04-14');
    expect(window.latest).toBe('2024-04-15');
  });

  it('starts the day after the latest closing', () => {
    const window = buildConversionWindow({
      lastClosingEnd: '2025-12-31',
      firstTransactionDate: null,
      today,
    });
    expect(window.earliest).toBe('2026-01-01');
    expect(window.suggested).toBe(today);
  });

  it('uses the first allowed day when the day before the first journal is still closed', () => {
    const window = buildConversionWindow({
      lastClosingEnd: '2026-01-31',
      firstTransactionDate: '2026-02-01',
      today,
    });
    expect(window.conflict).toBe(false);
    expect(window.suggested).toBe('2026-02-01');
  });

  it('is a conflict when the closing ends after the first journal', () => {
    const window = buildConversionWindow({
      lastClosingEnd: '2025-12-31',
      firstTransactionDate: '2024-04-15T00:00:00.000Z',
      today,
    });
    expect(window.conflict).toBe(true);
    expect(window.suggested).toBeNull();
  });

  it('never suggests a day in the future', () => {
    const window = buildConversionWindow({
      lastClosingEnd: null,
      firstTransactionDate: '2027-01-01',
      today,
    });
    expect(window.suggested).toBe(today);
  });
});

describe('opening equity', () => {
  const equity = row({
    id: 'eq',
    name: 'Ekuitas Saldo Awal',
    accountNumber: '3-10000',
    normalSide: 'credit',
  });

  it('finds the account by code first, then by name', () => {
    const other = row({ id: 'x', name: 'Modal', accountNumber: '3-10001' });
    expect(findOpeningEquityRow([other, equity])?.id).toBe('eq');
    const byName = row({ id: 'n', name: 'Ekuitas  Saldo Awal', accountNumber: '3-99999' });
    expect(findOpeningEquityRow([other, byName])?.id).toBe('n');
    expect(findOpeningEquityRow([other])).toBeUndefined();
  });

  it('records a missing credit on the credit side', () => {
    const rows = [row({ id: 'kas', debit: 1000.1 }), equity];
    const result = balanceToEquity(rows, 'eq');
    expect(result.find((r) => r.id === 'eq')).toMatchObject({ debit: 0, credit: 1000.1 });
    expect(summarizeOpeningBalance(result).isBalanced).toBe(true);
  });

  it('records a missing debit on the debit side', () => {
    const rows = [row({ id: 'utang', credit: 500 }), equity];
    const result = balanceToEquity(rows, 'eq');
    expect(result.find((r) => r.id === 'eq')).toMatchObject({ debit: 500, credit: 0 });
  });

  it('replaces its own amount, so a second press changes nothing', () => {
    const rows = [row({ id: 'kas', debit: 1000 }), { ...equity, credit: 300 }];
    const once = balanceToEquity(rows, 'eq');
    expect(once.find((r) => r.id === 'eq')?.credit).toBe(1000);
    expect(balanceToEquity(once, 'eq')).toEqual(once);
  });

  it('clears the account when the rest already balances', () => {
    const rows = [
      row({ id: 'kas', debit: 100 }),
      row({ id: 'bank', credit: 100 }),
      { ...equity, credit: 50 },
    ];
    const result = balanceToEquity(rows, 'eq');
    expect(result.find((r) => r.id === 'eq')).toMatchObject({ debit: 0, credit: 0 });
  });
});

describe('countProfitLossFilled', () => {
  it('counts only revenue and expense accounts with an amount', () => {
    const rows = [
      row({ id: 'a', accountNumber: '1-10000', debit: 5 }),
      row({ id: 'b', accountNumber: '4-10000', credit: 5 }),
      row({ id: 'c', accountNumber: '6-10000', debit: 0 }),
      row({ id: 'd', accountNumber: '8-10000', debit: 9 }),
    ];
    expect(countProfitLossFilled(rows)).toBe(2);
  });
});

describe('normal side of a contra account', () => {
  const contra = (over: Partial<SimpleAccount>): SimpleAccount => ({
    id: 'c1',
    name: 'Cadangan Kerugian Piutang',
    accountNumber: '1-10201',
    type: 'credit',
    isContra: true,
    ...over,
  });

  it('takes normalBalance as it is, without flipping the contra flag again', () => {
    const [rowFromServer] = buildOpeningRows([contra({ normalBalance: 'credit' })], []);
    expect(rowFromServer.normalSide).toBe('credit');
    const [discount] = buildOpeningRows(
      [
        contra({
          name: 'Diskon Penjualan',
          accountNumber: '4-30000',
          type: 'debit',
          normalBalance: 'debit',
        }),
      ],
      []
    );
    expect(discount.normalSide).toBe('debit');
  });

  it('still flips the category side for an answer without normalBalance', () => {
    const [older] = buildOpeningRows([contra({ type: 'debit' })], []);
    expect(older.normalSide).toBe('credit');
  });
});
