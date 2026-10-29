import type { JournalAccounts } from '@/module/chart-of-accounts';
import {
  accountKey,
  applyAmountEntry,
  buildBalancePayload,
  checkOpeningPublish,
  getBalanceState,
  isNormalDebit,
  mergeDraftIntoAccounts,
  summarizeOpeningBalance,
} from './openingBalanceRules';

const row = (over: Partial<JournalAccounts> = {}): JournalAccounts => ({
  id: 'a1',
  name: 'Kas',
  amount: 0,
  debit: 0,
  credit: 0,
  ...over,
});

describe('I4 opening balance totals and publish gate (characterization)', () => {
  it('sums both sides and reports balanced when equal and above zero', () => {
    const result = summarizeOpeningBalance([
      { debit: 700000, credit: 0 },
      { debit: 300000, credit: 0 },
      { debit: 0, credit: 1000000 },
    ]);
    expect(result).toEqual({
      totalDebit: 1000000,
      totalCredit: 1000000,
      difference: 0,
      isBalanced: true,
    });
  });

  it('reports the absolute difference when unbalanced', () => {
    const result = summarizeOpeningBalance([
      { debit: 500, credit: 0 },
      { debit: 0, credit: 800 },
    ]);
    expect(result.difference).toBe(300);
    expect(result.isBalanced).toBe(false);
  });

  it('is not balanced when both totals are zero', () => {
    const result = summarizeOpeningBalance([{ debit: 0, credit: 0 }]);
    expect(result.isBalanced).toBe(false);
    expect(summarizeOpeningBalance([]).isBalanced).toBe(false);
  });

  it('counts missing or non numeric amounts as zero', () => {
    const result = summarizeOpeningBalance([
      { debit: undefined, credit: 'abc' },
      { debit: '1000', credit: null },
      { debit: 0, credit: 1000 },
    ]);
    expect(result.totalDebit).toBe(1000);
    expect(result.totalCredit).toBe(1000);
    expect(result.isBalanced).toBe(true);
  });

  it('publish gate: empty, then unbalanced, then ready', () => {
    expect(checkOpeningPublish(0, 0)).toBe('empty');
    expect(checkOpeningPublish(100, 0)).toBe('unbalanced');
    expect(checkOpeningPublish(0, 100)).toBe('unbalanced');
    expect(checkOpeningPublish(100, 99)).toBe('unbalanced');
    expect(checkOpeningPublish(100, 100)).toBe('ready');
  });
});

describe('I5 isNormalDebit in TableBeginningBalance (characterization)', () => {
  it('uses the backend flag first, even against a credit keyword', () => {
    expect(isNormalDebit('Hutang Usaha', true)).toBe(true);
    expect(isNormalDebit('Kas', false)).toBe(false);
  });

  it.each(['kewajiban', 'hutang', 'liabilitas', 'modal', 'ekuitas', 'pendapatan', 'penjualan'])(
    'falls back to credit for the keyword %s, in any case',
    (word) => {
      expect(isNormalDebit(word)).toBe(false);
      expect(isNormalDebit(`Total ${word.toUpperCase()} Lancar`)).toBe(false);
    }
  );

  it('falls back to debit for other or empty categories', () => {
    expect(isNormalDebit('Kas & Bank')).toBe(true);
    expect(isNormalDebit('Beban Gaji')).toBe(true);
    expect(isNormalDebit('')).toBe(true);
    expect(isNormalDebit(undefined)).toBe(true);
  });

  it('has no contra handling', () => {
    expect(isNormalDebit('Kas', undefined)).toBe(true);
  });
});

describe('opening balance row helpers', () => {
  it('states: balanced, empty, unbalanced', () => {
    expect(getBalanceState(10, 10, true)).toBe('balanced');
    expect(getBalanceState(0, 0, false)).toBe('empty');
    expect(getBalanceState(5, 0, false)).toBe('unbalanced');
  });

  it('reads the key from id or legacy _id', () => {
    expect(accountKey(row())).toBe('a1');
    expect(accountKey({ ...row({ id: '' }), _id: 'x9' } as JournalAccounts)).toBe('x9');
  });

  it('merges draft lines by id, _id, account id string or embedded account', () => {
    const accounts = [
      row({ id: 'a1' }),
      row({ id: 'a2' }),
      row({ id: 'a3' }),
      row({ id: 'a4', debit: 7 }),
    ];
    const merged = mergeDraftIntoAccounts(accounts, [
      { id: 'a1', debit: '100' },
      { accounts: 'a2', credit: 50 },
      { accounts: { _id: 'a3' }, debit: 5, credit: 0 },
    ]);
    expect(merged.map((r) => [r.debit, r.credit])).toEqual([
      [100, 0],
      [0, 50],
      [5, 0],
      [7, 0],
    ]);
  });

  it('keeps the opposite side only when the typed value is zero', () => {
    const rows = [row({ credit: 400 })];
    expect(applyAmountEntry(rows, 'a1', 'debit', '1.500,50')[0].debit).toBe(150050);
    expect(applyAmountEntry(rows, 'a1', 'debit', '250')[0].credit).toBe(0);
    expect(applyAmountEntry(rows, 'a1', 'debit', '0')[0].credit).toBe(400);
  });

  it('sends the duplicated payload keys exactly', () => {
    const payload = buildBalancePayload([row({ debit: 10 })], '2026-01-01');
    expect(payload).toEqual({
      period: '2026-01-01',
      balances: [{ account: 'a1', accounts: 'a1', debit: 10, credit: 0 }],
      accounts: [{ account: 'a1', accounts: 'a1', debit: 10, credit: 0 }],
    });
    expect(payload.accounts).toBe(payload.balances);
  });
});
