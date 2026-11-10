import { mapTrialBalancePage } from './trialBalanceMapper';

const account = (overrides: Record<string, unknown> = {}) => ({
  account: {
    id: 'a1',
    accountNumber: '4-10001',
    name: 'Pendapatan IPL',
    category: { name: 'Pendapatan' },
    isHead: false,
    isContra: false,
  },
  opening: { debit: null, credit: 0 },
  movement: { debit: null, credit: 9000000 },
  closing: { debit: null, credit: 9000000 },
  profitLoss: { debit: null, credit: 9000000 },
  balanceSheet: null,
  ...overrides,
});

const body = (accounts: unknown[]) => ({
  data: {
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    accounts,
    totals: {
      opening: { debit: 1, credit: 1 },
      movement: { debit: 2, credit: 2 },
      closing: { debit: 3, credit: 3 },
      profitLoss: { debit: 4, credit: 5 },
      balanceSheet: { debit: 6, credit: 7 },
    },
    balancing: { profitLoss: { debit: 1, credit: 0 }, balanceSheet: { debit: 0, credit: 1 } },
    profit: 1,
    pagination: { page: 1, limit: 100, totalRows: 1, totalPages: 1 },
  },
});

describe('mapTrialBalancePage', () => {
  it('keeps an empty side as null and a real zero as 0', () => {
    const [row] = mapTrialBalancePage(body([account()])).accounts;
    expect(row.opening).toEqual({ debit: null, credit: 0 });
    expect(row.movement).toEqual({ debit: null, credit: 9000000 });
  });

  it('keeps a whole group that is null as null', () => {
    const [row] = mapTrialBalancePage(body([account()])).accounts;
    expect(row.balanceSheet).toBeNull();
    expect(row.profitLoss).not.toBeNull();
  });

  it('reads the account object and the parent flag', () => {
    const [row] = mapTrialBalancePage(
      body([account({ account: { id: 'h', accountNumber: '1-10000', name: 'Kas', isHead: true } })])
    ).accounts;
    expect(row).toMatchObject({ id: 'h', accountNumber: '1-10000', name: 'Kas', isHead: true });
    expect(row.isContra).toBe(false);
  });

  it('takes totals, balancing, profit and pagination from the server', () => {
    const report = mapTrialBalancePage(body([account()]));
    expect(report.totals.balanceSheet).toEqual({ debit: 6, credit: 7 });
    expect(report.balancing.profitLoss).toEqual({ debit: 1, credit: 0 });
    expect(report.profit).toBe(1);
    expect(report.pagination).toEqual({ page: 1, limit: 100, totalRows: 1, totalPages: 1 });
    expect(report.startDate).toBe('2026-11-01');
  });

  it('survives a body that is not an object', () => {
    for (const bad of [null, undefined, 'x', 42, []]) {
      const report = mapTrialBalancePage(bad);
      expect(report.accounts).toEqual([]);
      expect(report.totals.closing).toEqual({ debit: 0, credit: 0 });
      expect(report.pagination.totalPages).toBe(1);
    }
  });

  it('survives an account row that is not an object', () => {
    const [row] = mapTrialBalancePage(body(['x'])).accounts;
    expect(row.accountNumber).toBe('');
    expect(row.opening).toBeNull();
  });
});
