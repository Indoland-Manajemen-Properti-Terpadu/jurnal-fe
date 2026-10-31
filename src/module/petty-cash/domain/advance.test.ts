import {
  settlementBalance,
  settlementTotal,
  toAdvanceRequestInput,
  toSettlementInput,
  validateAdvanceRequest,
  validateSettlementDraft,
  type SettlementDraft,
} from '@/module/petty-cash/domain/advance';

const TODAY = '2026-10-31';

describe('validateAdvanceRequest', () => {
  const codes = (amount: number | '', purpose: string, maxAmount: number | null = 2000000) =>
    validateAdvanceRequest({ amount, purpose }, { maxAmount }).map((i) => `${i.path}:${i.code}`);

  it('accepts a purpose and a whole amount within the limit', () => {
    expect(codes(500000, 'Konsumsi rapat')).toEqual([]);
  });

  it('requires an amount and a purpose', () => {
    expect(codes('', '  ')).toEqual(['amount:REQUIRED', 'purpose:REQUIRED']);
  });

  it('refuses zero, cents and an amount above the per-request limit of the fund', () => {
    expect(codes(0, 'x')).toEqual(['amount:POSITIVE_AMOUNT']);
    expect(codes(10.5, 'x')).toEqual(['amount:WHOLE_RUPIAH']);
    expect(codes(3000000, 'x')).toEqual(['amount:OVER_LIMIT']);
    expect(codes(3000000, 'x', null)).toEqual([]);
  });
});

describe('toAdvanceRequestInput', () => {
  it('sends the fund, the amount and the trimmed purpose', () => {
    expect(toAdvanceRequestInput('f1', { amount: 500000, purpose: '  Konsumsi  ' })).toEqual({
      fundId: 'f1',
      amount: 500000,
      purpose: 'Konsumsi',
    });
  });
});

const settlement = (over: Partial<SettlementDraft> = {}): SettlementDraft => ({
  date: TODAY,
  beneficiary: 'Resto',
  description: 'Konsumsi',
  receiptNumber: '',
  lines: [{ key: 'a', description: 'Makan siang', amount: 300000, expenseAccountId: null }],
  ...over,
});

const issues = (d: SettlementDraft) =>
  validateSettlementDraft(d, TODAY).map((i) => `${i.path}:${i.code}`);

describe('validateSettlementDraft', () => {
  it('accepts spending with a payee and a date', () => {
    expect(issues(settlement())).toEqual([]);
  });

  it('accepts nothing spent: no lines, everything is returned', () => {
    expect(issues(settlement({ lines: [] }))).toEqual([]);
  });

  it('requires a date that is not in the future, and a payee when something was spent', () => {
    expect(issues(settlement({ date: '' }))).toContain('date:REQUIRED');
    expect(issues(settlement({ date: '2026-11-01' }))).toContain('date:FUTURE_DATE');
    expect(issues(settlement({ beneficiary: ' ' }))).toContain('beneficiary:REQUIRED');
  });

  it('checks every line for a description and a positive whole amount', () => {
    const lines = [
      { key: 'a', description: '', amount: 1000 as number | '', expenseAccountId: null },
      { key: 'b', description: 'x', amount: '' as number | '', expenseAccountId: null },
      { key: 'c', description: 'x', amount: 0 as number | '', expenseAccountId: null },
      { key: 'd', description: 'x', amount: 1.5 as number | '', expenseAccountId: null },
    ];
    expect(issues(settlement({ lines }))).toEqual([
      'lines.0.description:REQUIRED',
      'lines.1.amount:REQUIRED',
      'lines.2.amount:POSITIVE_AMOUNT',
      'lines.3.amount:WHOLE_RUPIAH',
    ]);
  });
});

describe('settlementTotal and settlementBalance', () => {
  it('adds the lines without float drift and ignores empty amounts', () => {
    const lines = [
      { key: 'a', description: 'x', amount: 0.1 as number | '', expenseAccountId: null },
      { key: 'b', description: 'x', amount: 0.2 as number | '', expenseAccountId: null },
      { key: 'c', description: 'x', amount: '' as number | '', expenseAccountId: null },
    ];
    expect(settlementTotal(settlement({ lines }))).toBe(0.3);
  });

  it('works out what comes back to the box or what the box still owes the employee', () => {
    expect(settlementBalance(500000, 420000)).toEqual({ kind: 'RETURN', amount: 80000 });
    expect(settlementBalance(500000, 560000)).toEqual({ kind: 'EXTRA', amount: 60000 });
    expect(settlementBalance(500000, 500000)).toEqual({ kind: 'EVEN', amount: 0 });
  });
});

describe('toSettlementInput', () => {
  it('sends the filled fields, trimmed, with an account only where one was chosen', () => {
    const input = toSettlementInput(
      settlement({
        description: '  Konsumsi  ',
        receiptNumber: ' R-1 ',
        lines: [
          { key: 'a', description: ' Makan ', amount: 300000, expenseAccountId: null },
          { key: 'b', description: 'Kertas', amount: 120000, expenseAccountId: 'acc1' },
        ],
      })
    );
    expect(input).toEqual({
      date: TODAY,
      beneficiary: 'Resto',
      description: 'Konsumsi',
      receiptNumber: 'R-1',
      lines: [
        { description: 'Makan', amount: 300000 },
        { description: 'Kertas', amount: 120000, expenseAccountId: 'acc1' },
      ],
    });
  });

  it('leaves out an empty description and receipt number', () => {
    const input = toSettlementInput(settlement({ description: ' ', receiptNumber: '' }));
    expect(input).not.toHaveProperty('description');
    expect(input).not.toHaveProperty('receiptNumber');
  });

  it('leaves out the beneficiary when nothing was spent', () => {
    const input = toSettlementInput(settlement({ beneficiary: ' ', lines: [] }));
    expect(input).not.toHaveProperty('beneficiary');
    expect(input.lines).toEqual([]);
  });
});
