import type { OpeningRow, SimpleAccount } from './beginningBalance';
import {
  accountClassOf,
  applyAmountEntry,
  balanceSignature,
  buildBalanceLines,
  buildBalancePayload,
  buildOpeningRows,
  clearAccountRow,
  clearAllRows,
  conversionDateIssue,
  filterOpeningRows,
  formatAmountInput,
  getBalanceState,
  openingActions,
  parseAmountEntry,
  resolveSavedBalance,
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

const simple = (over: Partial<SimpleAccount> = {}): SimpleAccount => ({
  id: 'a1',
  name: 'Kas',
  accountNumber: '1-10000',
  type: 'debit',
  isContra: false,
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
});

describe('opening balance states and what the buttons may do', () => {
  it('states: balanced, empty, unbalanced', () => {
    expect(getBalanceState(10, 10, true)).toBe('balanced');
    expect(getBalanceState(0, 0, false)).toBe('empty');
    expect(getBalanceState(5, 0, false)).toBe('unbalanced');
  });

  it('a draft can be saved unbalanced; it only needs a change', () => {
    expect(openingActions('unbalanced', true).canSaveDraft).toBe(true);
    expect(openingActions('balanced', true).canSaveDraft).toBe(true);
    expect(openingActions('empty', true).canSaveDraft).toBe(true);
    expect(openingActions('balanced', false).canSaveDraft).toBe(false);
  });

  it('a published balance is published again only after a change', () => {
    expect(openingActions('balanced', false, true).canPublish).toBe(false);
    expect(openingActions('balanced', true, true).canPublish).toBe(true);
    expect(openingActions('unbalanced', true, true).canPublish).toBe(false);
  });

  it('publishing needs a balanced total above zero', () => {
    expect(openingActions('balanced', false).canPublish).toBe(true);
    expect(openingActions('empty', true).canPublish).toBe(false);
    expect(openingActions('unbalanced', true).canPublish).toBe(false);
  });
});

describe('buildOpeningRows', () => {
  it('lists every account and lays the saved amounts over them (by _id or id)', () => {
    const rows = buildOpeningRows(
      [simple({ id: 'a1' }), simple({ id: 'a2' }), simple({ id: 'a3' })],
      [
        { _id: 'a1', debit: 100, credit: 0 },
        { id: 'a2', credit: '50' },
      ]
    );
    expect(rows.map((r) => [r.id, r.debit, r.credit])).toEqual([
      ['a1', 100, 0],
      ['a2', 0, 50],
      ['a3', 0, 0],
    ]);
  });

  it('takes the normal side from the type and flips it for a contra account', () => {
    const rows = buildOpeningRows(
      [
        simple({ id: 'd', type: 'debit' }),
        simple({ id: 'c', type: 'credit' }),
        simple({ id: 'dc', type: 'credit', isContra: true }),
        simple({ id: 'cc', type: 'debit', isContra: true }),
      ],
      []
    );
    expect(rows.map((r) => r.normalSide)).toEqual(['debit', 'credit', 'debit', 'credit']);
  });

  it('keeps a saved amount for an account the list lacks, so the totals stay the saved ones', () => {
    const rows = buildOpeningRows(
      [simple({ id: 'a1' })],
      [
        { _id: 'x', name: 'Pembulatan', accountNumber: '7-10004', credit: 9 },
        { _id: 'zero', name: 'Nol', accountNumber: '1-1', debit: 0, credit: 0 },
      ]
    );
    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({ id: 'x', credit: 9, normalSide: 'credit' });
  });
});

describe('filterOpeningRows', () => {
  const rows = [
    row({ id: '1', accountNumber: '1-10000', name: 'Kas' }),
    row({ id: '2', accountNumber: '2-10000', name: 'Hutang Usaha', credit: 5 }),
    row({ id: '3', accountNumber: '6-10000', name: 'Beban Gaji' }),
  ];
  const all = { query: '', accountClass: null, onlyFilled: false };

  it('finds by code or name', () => {
    expect(filterOpeningRows(rows, { ...all, query: 'gaji' }).map((r) => r.id)).toEqual(['3']);
    expect(filterOpeningRows(rows, { ...all, query: '2-10' }).map((r) => r.id)).toEqual(['2']);
  });

  it('filters one class by the first digit of the code', () => {
    expect(filterOpeningRows(rows, { ...all, accountClass: 6 }).map((r) => r.id)).toEqual(['3']);
  });

  it('keeps only the rows with an amount', () => {
    expect(filterOpeningRows(rows, { ...all, onlyFilled: true }).map((r) => r.id)).toEqual(['2']);
  });

  it('reads the class of a code', () => {
    expect(accountClassOf('4-20013')).toBe(4);
    expect(accountClassOf('9-1')).toBeNull();
    expect(accountClassOf('')).toBeNull();
  });
});

describe('amount entry', () => {
  it('keeps the opposite side only when the typed value is zero', () => {
    const rows = [row({ credit: 400 })];
    expect(applyAmountEntry(rows, 'a1', 'debit', '1.500,50')[0].debit).toBe(1500.5);
    expect(applyAmountEntry(rows, 'a1', 'debit', '250')[0].credit).toBe(0);
    expect(applyAmountEntry(rows, 'a1', 'debit', '0')[0].credit).toBe(400);
  });

  it('clears one row or all rows', () => {
    const rows = [row({ id: 'a', debit: 5 }), row({ id: 'b', credit: 6 })];
    expect(clearAccountRow(rows, 'a').map((r) => [r.debit, r.credit])).toEqual([
      [0, 0],
      [0, 6],
    ]);
    expect(clearAllRows(rows).every((r) => r.debit === 0 && r.credit === 0)).toBe(true);
  });
});

describe('the payload of the draft and of the publish', () => {
  it('is the period and the lines with an amount, each with only the side that has one', () => {
    const payload = buildBalancePayload(
      [
        row({ id: 'a', debit: 100000 }),
        row({ id: 'b', debit: 0, credit: 0 }),
        row({ id: 'c', credit: 100000 }),
      ],
      '2026-04-07'
    );
    expect(payload).toEqual({
      period: '2026-04-07',
      balances: [
        { account: 'a', debit: 100000 },
        { account: 'c', credit: 100000 },
      ],
    });
    expect(payload).not.toHaveProperty('accounts');
  });

  it('sends nothing for an account without an amount', () => {
    expect(buildBalanceLines([row()])).toEqual([]);
  });

  it('has the same signature for the same content, and another when an amount or the date changes', () => {
    const rows = [row({ debit: 5 })];
    expect(balanceSignature(rows, '2026-01-01')).toBe(
      balanceSignature([row({ debit: 5 })], '2026-01-01')
    );
    expect(balanceSignature(rows, '2026-01-01')).not.toBe(
      balanceSignature([row({ debit: 6 })], '2026-01-01')
    );
    expect(balanceSignature(rows, '2026-01-01')).not.toBe(balanceSignature(rows, '2026-01-02'));
  });
});

describe('parseAmountEntry', () => {
  it.each([
    ['1.500,50', 1500.5],
    ['1500,5', 1500.5],
    ['1500.5', 1500.5],
    ['1500.50', 1500.5],
    ['1.500', 1500],
    ['1.500.000', 1500000],
    ['1.500.000,25', 1500000.25],
    ['250', 250],
    ['0,5', 0.5],
    ['Rp 2.000', 2000],
    ['-300', 300],
    ['12,345', 12.35],
    ['', 0],
    ['abc', 0],
    [',', 0],
  ])('reads %j as %d', (raw, expected) => {
    expect(parseAmountEntry(raw)).toBe(expected);
  });
});

describe('resolveSavedBalance', () => {
  const log = (createdAt: string, debit: number, action = 'PUBLISH') => ({
    action,
    createdAt,
    period: '2026-06-30T00:00:00.000Z',
    balances: [{ account: { id: 'kas' }, debit, credit: 0 }],
  });

  it('is the draft while nothing is published', () => {
    const draft = { id: 'd', period: '2026-11-01', accounts: [{ _id: 'kas', debit: 5 }] };
    expect(resolveSavedBalance(draft, [log('2026-11-04', 9)])).toEqual({
      period: '2026-11-01',
      entries: draft.accounts,
    });
  });

  it('takes the amounts of the draft after a publish, and the date of the latest publish log', () => {
    const draft = { isPublished: true, period: '2026-11-01', accounts: [{ _id: 'kas', debit: 5 }] };
    const saved = resolveSavedBalance(draft, [log('2026-11-04', 9)]);
    expect(saved.entries).toBe(draft.accounts);
    expect(saved.period).toBe('2026-06-30T00:00:00.000Z');
  });

  it('keeps the draft period when a published draft has no publish log', () => {
    const draft = { isPublished: true, period: '2026-11-01', accounts: [{ _id: 'kas', debit: 5 }] };
    expect(resolveSavedBalance(draft, [])).toEqual({
      period: '2026-11-01',
      entries: draft.accounts,
    });
  });

  it('is the latest publish log when the published draft was emptied by the server', () => {
    const draft = { isPublished: true, period: '2026-11-01', accounts: [{ _id: 'kas', debit: 0 }] };
    const saved = resolveSavedBalance(draft, [
      log('2026-11-01', 1),
      log('2026-11-04', 9),
      log('2026-11-05', 99, 'UPDATE_DRAFT'),
    ]);
    expect(saved.period).toBe('2026-06-30T00:00:00.000Z');
    expect(saved.entries).toEqual([{ _id: 'kas', debit: 9, credit: 0 }]);
  });

  it('follows a later publish, which the server logs as UPDATE', () => {
    const draft = { isPublished: true, period: '2026-11-01', accounts: [] };
    const saved = resolveSavedBalance(draft, [
      log('2026-11-04', 1000000),
      log('2026-11-05', 1100000, 'UPDATE'),
    ]);
    expect(saved.entries).toEqual([{ _id: 'kas', debit: 1100000, credit: 0 }]);
  });

  it('falls back to the draft when there is no publish log', () => {
    const draft = { isPublished: true, period: '2026-11-01', accounts: [] };
    expect(resolveSavedBalance(draft, [])).toEqual({ period: '2026-11-01', entries: [] });
    expect(resolveSavedBalance(undefined, undefined)).toEqual({ period: null, entries: [] });
  });
});

describe('conversionDateIssue', () => {
  it('refuses a date in a locked period', () => {
    expect(conversionDateIssue('2026-06-30', null, true)).toBe('locked');
  });

  it('refuses a date after the first transaction, but not the same day or before', () => {
    expect(conversionDateIssue('2026-07-02', '2026-07-01T00:00:00.000Z', false)).toBe(
      'afterFirstTransaction'
    );
    expect(conversionDateIssue('2026-07-01', '2026-07-01T00:00:00.000Z', false)).toBeNull();
    expect(conversionDateIssue('2026-06-30', '2026-07-01T00:00:00.000Z', false)).toBeNull();
  });

  it('accepts any date when there is no first transaction and no lock', () => {
    expect(conversionDateIssue('2030-01-01', null, false)).toBeNull();
    expect(conversionDateIssue('2030-01-01', undefined, false)).toBeNull();
    expect(conversionDateIssue(null, '2026-07-01', true)).toBeNull();
  });
});

describe('formatAmountInput', () => {
  it.each([
    ['', ''],
    ['2', '2'],
    ['200', '200'],
    ['2000', '2.000'],
    ['200000', '200.000'],
    ['1500000', '1.500.000'],
    ['1.500.000', '1.500.000'],
    ['1500,5', '1.500,5'],
    ['1500,', '1.500,'],
    ['1500,567', '1.500,56'],
    ['1,5,6', '1,56'],
    [',5', '0,5'],
    ['0', '0'],
    ['007', '7'],
    ['Rp 2.000abc', '2.000'],
    ['-300', '300'],
    ['abc', ''],
  ])('formats %j as %j', (raw, expected) => {
    expect(formatAmountInput(raw)).toBe(expected);
  });

  it('removes the dot of a deleted digit instead of reading it as a decimal', () => {
    expect(formatAmountInput('12.34')).toBe('1.234');
  });

  it('gives text that parses back to the same amount', () => {
    expect(parseAmountEntry(formatAmountInput('1500000,5'))).toBe(1500000.5);
    expect(parseAmountEntry(formatAmountInput('200000'))).toBe(200000);
  });
});
