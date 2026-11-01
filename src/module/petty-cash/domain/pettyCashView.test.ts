import {
  cashBookTypeKey,
  imprestEquation,
  isValidObjectId,
  summarizeVoucherAccounts,
  varianceView,
  voucherBreakdown,
} from '@/module/petty-cash/domain/pettyCashView';
import type { FundBalance, VoucherLine } from '@/module/petty-cash/domain/pettyCashEntities';

const line = (over: Partial<VoucherLine> & Pick<VoucherLine, 'amount'>): VoucherLine => ({
  lineNo: 1,
  expenseAccountId: 'e1',
  expenseAccount: { id: 'e1', name: 'Beban Operasional', accountNumber: '6-10000' },
  description: '',
  tax: null,
  taxAmount: 0,
  ...over,
});

describe('varianceView', () => {
  it('reads a negative unsettled variance as a cash shortage to be refilled', () => {
    expect(varianceView(-20000)).toEqual({ kind: 'SHORT', amount: 20000 });
  });

  it('reads a positive unsettled variance as a surplus', () => {
    expect(varianceView(15000)).toEqual({ kind: 'OVER', amount: 15000 });
  });

  it('reports no variance for zero, including negative zero', () => {
    expect(varianceView(0)).toEqual({ kind: 'NONE', amount: 0 });
    expect(varianceView(-0)).toEqual({ kind: 'NONE', amount: 0 });
  });
});

describe('voucherBreakdown', () => {
  it('splits net and tax the way the server builds totalAmount', () => {
    const lines = [line({ amount: 100000, taxAmount: 11000 }), line({ lineNo: 2, amount: 50000 })];
    expect(voucherBreakdown(lines, 161000)).toEqual({ net: 150000, tax: 11000, reconciles: true });
  });

  it('keeps cent-exact sums for decimal amounts', () => {
    const lines = [line({ amount: 0.1 }), line({ lineNo: 2, amount: 0.2 })];
    expect(voucherBreakdown(lines, 0.3)).toEqual({ net: 0.3, tax: 0, reconciles: true });
  });

  it('flags a breakdown that does not add up to the server total', () => {
    const lines = [line({ amount: 100000, taxAmount: 11000 })];
    expect(voucherBreakdown(lines, 105000).reconciles).toBe(false);
  });

  it('is zero for no lines', () => {
    expect(voucherBreakdown([], 0)).toEqual({ net: 0, tax: 0, reconciles: true });
  });
});

describe('summarizeVoucherAccounts', () => {
  it('names the first account and counts the rest', () => {
    const lines = [
      line({ amount: 1 }),
      line({
        lineNo: 2,
        amount: 1,
        expenseAccountId: 'e2',
        expenseAccount: { id: 'e2', name: 'Beban Karyawan', accountNumber: '6-10001' },
      }),
      line({ lineNo: 3, amount: 1 }),
    ];
    expect(summarizeVoucherAccounts(lines)).toEqual({
      first: lines[0].expenseAccount,
      extra: 1,
    });
  });

  it('does not count repeats of the same account as extra', () => {
    expect(
      summarizeVoucherAccounts([line({ amount: 1 }), line({ lineNo: 2, amount: 2 })]).extra
    ).toBe(0);
  });

  it('resolves the account name from lookups when a list item carries only the id', () => {
    const listLine = line({ amount: 1, expenseAccount: null });
    const account = { id: 'e1', name: 'Beban Operasional', accountNumber: '6-10000' };
    expect(
      summarizeVoucherAccounts([listLine], (id) => (id === 'e1' ? account : undefined))
    ).toEqual({ first: account, extra: 0 });
    expect(summarizeVoucherAccounts([listLine]).first).toBeNull();
  });

  it('has no account for a voucher without lines', () => {
    expect(summarizeVoucherAccounts([])).toEqual({ first: null, extra: 0 });
  });
});

describe('cashBookTypeKey', () => {
  it('maps known entry types to a translation key', () => {
    expect(cashBookTypeKey('REPLENISHMENT')).toBe('REPLENISHMENT');
    expect(cashBookTypeKey('VARIANCE_ADJUSTMENT')).toBe('VARIANCE_ADJUSTMENT');
    expect(cashBookTypeKey('ADVANCE_RECEIVABLE')).toBe('ADVANCE_RECEIVABLE');
  });

  it('falls back to a generic label for a type the app does not know yet', () => {
    expect(cashBookTypeKey('SOMETHING_NEW')).toBe('OTHER');
  });
});

const balance = (over: Partial<FundBalance>): FundBalance => ({
  cashBalance: 0,
  availableCash: 0,
  reservedAmount: 0,
  pendingVoucherAmount: 0,
  outstandingAdvanceAmount: 0,
  unsettledVariance: 0,
  replenishmentAmount: 0,
  availableCashRatio: 0,
  needsReplenishment: false,
  isBalanced: true,
  ...over,
});

const sumRows = (rows: Array<{ amount: number }>) =>
  rows.reduce((total, row) => total + row.amount, 0);

describe('imprestEquation', () => {
  it('adds up to the ceiling when the fund has no variance', () => {
    const rows = imprestEquation(
      balance({
        cashBalance: 4575000,
        pendingVoucherAmount: 25000,
        outstandingAdvanceAmount: 400000,
      })
    );
    expect(rows.map((row) => row.key)).toEqual(['cash', 'pendingVouchers', 'advances']);
    expect(sumRows(rows)).toBe(5000000);
  });

  it('adds a shortage, so cash plus the shortage returns to the ceiling', () => {
    const rows = imprestEquation(
      balance({
        cashBalance: 4000000,
        pendingVoucherAmount: 800000,
        outstandingAdvanceAmount: 180000,
        unsettledVariance: -20000,
      })
    );
    expect(rows.at(-1)).toEqual({ key: 'shortage', amount: 20000 });
    expect(sumRows(rows)).toBe(5000000);
  });

  it('deducts a surplus, so the rows still add up to the ceiling', () => {
    const rows = imprestEquation(
      balance({
        cashBalance: 4000000,
        pendingVoucherAmount: 800000,
        outstandingAdvanceAmount: 300000,
        unsettledVariance: 100000,
      })
    );
    expect(rows.at(-1)).toEqual({ key: 'surplus', amount: -100000 });
    expect(sumRows(rows)).toBe(5000000);
  });
});

describe('isValidObjectId', () => {
  it('accepts a 24 character hex id', () => {
    expect(isValidObjectId('6ae5c63fa5fe03e546a002f3')).toBe(true);
  });

  it.each(['', 'not-an-id', '6ae5c63fa5fe03e546a002f', '6ae5c63fa5fe03e546a002fz', undefined])(
    'rejects %p',
    (value) => {
      expect(isValidObjectId(value)).toBe(false);
    }
  );
});
