import { describe, expect, it } from 'vitest';
import {
  getCashBalance,
  getFinancialHealthSummary,
  getMonthlyTrend,
  getReceivableAging,
  getSalesKpis,
  getTopDebtors,
  getBankAccounts,
} from './dashboardMetrics';
import type { BalanceSheetSummary, SaleSummary } from './dashboardTypes';

const mockBalanceSheet: BalanceSheetSummary = {
  endDate: '2026-10-16',
  currentAssets: [
    {
      accountId: '1',
      accountNumber: '1-1001',
      accountName: 'Bank Utama',
      categoryId: 'KB',
      categoryName: 'Kas & Bank',
      balance: 150_000_000,
    },
    {
      accountId: '2',
      accountNumber: '1-1201',
      accountName: 'Piutang Usaha',
      categoryId: 'AR',
      categoryName: 'Piutang',
      balance: 50_000_000,
    },
  ],
  nonCurrentAssets: [],
  liabilities: [],
  equity: [],
  totalCurrentAssets: 200_000_000,
  totalNonCurrentAssets: 100_000_000,
  totalDepreciation: 0,
  totalAssets: 300_000_000,
  totalLiabilities: 120_000_000,
  totalEquity: 180_000_000,
};

describe('dashboardMetrics', () => {
  it('computes cash balance and financial health equilibrium accurately', () => {
    const cash = getCashBalance(mockBalanceSheet);
    expect(cash).toBe(150_000_000);

    const health = getFinancialHealthSummary(mockBalanceSheet, cash);
    expect(health.isBalanced).toBe(true);
    expect(health.totalLiabilitiesAndEquity).toBe(300_000_000);
    expect(health.netWorkingCapital).toBe(80_000_000);
    expect(health.equityRatio).toBeCloseTo(60, 1);
    expect(health.liabilityRatio).toBeCloseTo(40, 1);
    expect(health.cashRatio).toBeCloseTo(50, 1);
  });

  it('supports bilingual month labels in getMonthlyTrend and custom labels in getReceivableAging', () => {
    const now = new Date(2026, 7, 15); // August 2026
    const sales: SaleSummary[] = [
      {
        id: 's1',
        transactionNumber: 'INV-001',
        customerName: 'PT Maju',
        transactionDate: '2026-08-10',
        dueDate: '2026-08-01',
        status: 'UNPAID',
        finalAmount: 10_000_000,
        paidAmount: 4_000_000,
        remainingAmount: 6_000_000,
      },
    ];

    const trendId = getMonthlyTrend(sales, 3, now, 'id');
    const trendEn = getMonthlyTrend(sales, 3, now, 'en');
    expect(trendId[2].label).toBe('Agu 26');
    expect(trendEn[2].label).toBe('Aug 26');
    expect(trendId[2].invoiced).toBe(10_000_000);
    expect(trendId[2].collected).toBe(4_000_000);

    const aging = getReceivableAging(sales, now, {
      current: 'Current',
      d1_30: '1-30 Days',
      d31_60: '31-60 Days',
      d60Plus: '60+ Days',
    });
    expect(aging[1].label).toBe('1-30 Days');
    expect(aging[1].amount).toBe(6_000_000);

    const kpi = getSalesKpis(sales, now);
    expect(kpi.collectionRate).toBeCloseTo(40, 1);
  });

  describe('whole-rupiah characterization', () => {
    const now = new Date(2026, 7, 15);
    const mk = (over: Partial<SaleSummary>): SaleSummary => ({
      id: 'x',
      transactionNumber: 'INV',
      customerName: 'PT Maju',
      transactionDate: '2026-08-10',
      dueDate: '2026-08-20',
      status: 'UNPAID',
      finalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      ...over,
    });
    const sales: SaleSummary[] = [
      mk({
        id: '1',
        finalAmount: 10_000_000,
        paidAmount: 4_000_000,
        remainingAmount: 6_000_000,
        dueDate: '2026-08-01',
      }),
      mk({
        id: '2',
        finalAmount: 2_500_000,
        paidAmount: 0,
        remainingAmount: 2_500_000,
        dueDate: '2026-06-01',
        customerName: 'CV Jaya',
      }),
      mk({ id: '3', finalAmount: 1_000_000, remainingAmount: 1_000_000, status: 'DRAFT' }),
      mk({
        id: '4',
        finalAmount: 7_000_000,
        paidAmount: 7_000_000,
        remainingAmount: 0,
        status: 'PAID',
        transactionDate: '2026-07-05',
      }),
      mk({
        id: '5',
        finalAmount: 500_000,
        remainingAmount: 500_000,
        dueDate: '2026-05-01',
        customerName: 'CV Jaya',
      }),
    ];

    it('computes KPIs', () => {
      const k = getSalesKpis(sales, now);
      expect(k.outstanding).toBe(9_000_000);
      expect(k.overdueAmount).toBe(9_000_000);
      expect(k.overdueCount).toBe(3);
      expect(k.monthRevenue).toBe(13_000_000);
      expect(k.draftAmount).toBe(1_000_000);
      expect(k.totalInvoiced).toBe(20_000_000);
      expect(k.totalCollected).toBe(11_000_000);
      expect(k.collectionRate).toBeCloseTo(55, 5);
    });

    it('buckets the trend and the aging', () => {
      const trend = getMonthlyTrend(sales, 3, now);
      expect(trend.map((p) => [p.invoiced, p.collected])).toEqual([
        [0, 0],
        [7_000_000, 7_000_000],
        [13_000_000, 4_000_000],
      ]);
      const aging = getReceivableAging(sales, now);
      expect(aging.map((b) => [b.key, b.amount, b.count])).toEqual([
        ['current', 0, 0],
        ['1-30', 6_000_000, 1],
        ['31-60', 0, 0],
        ['60+', 3_000_000, 2],
      ]);
    });

    it('ranks top debtors and bank accounts', () => {
      const d = getTopDebtors(sales, now);
      expect(d.map((x) => [x.customerName, x.totalOutstanding, x.invoiceCount])).toEqual([
        ['PT Maju', 6_000_000, 1],
        ['CV Jaya', 3_000_000, 2],
      ]);
      const banks = getBankAccounts({
        ...mockBalanceSheet,
        currentAssets: [
          ...mockBalanceSheet.currentAssets,
          { ...mockBalanceSheet.currentAssets[0], accountId: '3', balance: 200_000_000 },
        ],
      });
      expect(banks.map((b) => b.balance)).toEqual([200_000_000, 150_000_000]);
    });
  });

  describe('decimal amounts', () => {
    const now = new Date(2026, 7, 15);
    const mk = (id: string, over: Partial<SaleSummary>): SaleSummary => ({
      id,
      transactionNumber: id,
      customerName: 'PT Maju',
      transactionDate: '2026-08-10',
      dueDate: '2026-08-01',
      status: 'UNPAID',
      finalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      ...over,
    });
    const sales = [
      mk('a', { finalAmount: 0.1, paidAmount: 0.1, remainingAmount: 0.1 }),
      mk('b', { finalAmount: 0.2, paidAmount: 0, remainingAmount: 0.2 }),
      mk('c', { finalAmount: 1500.5, paidAmount: 0.7, remainingAmount: 1499.8 }),
    ];

    it('sums KPIs without float artefacts', () => {
      const k = getSalesKpis(sales, now);
      expect(k.outstanding).toBe(1500.1);
      expect(k.overdueAmount).toBe(1500.1);
      expect(k.monthRevenue).toBe(1500.8);
      expect(k.totalCollected).toBe(0.8);
    });

    it('sums the trend, the aging bucket and the debtor total', () => {
      expect(getMonthlyTrend(sales, 1, now)[0]).toMatchObject({ invoiced: 1500.8, collected: 0.8 });
      expect(getReceivableAging(sales, now)[1]).toMatchObject({ amount: 1500.1, count: 3 });
      expect(getTopDebtors(sales, now)[0]).toMatchObject({
        totalOutstanding: 1500.1,
        invoiceCount: 3,
      });
    });

    it('sums the cash balance and compares the accounting equation to the cent', () => {
      const bs: BalanceSheetSummary = {
        ...mockBalanceSheet,
        currentAssets: [0.1, 0.2].map((balance, i) => ({
          ...mockBalanceSheet.currentAssets[0],
          accountId: String(i),
          balance,
        })),
        totalCurrentAssets: 0.3,
        totalAssets: 0.3,
        totalLiabilities: 0.1,
        totalEquity: 0.2,
      };
      expect(getCashBalance(bs)).toBe(0.3);
      const h = getFinancialHealthSummary(bs, 0.3);
      expect(h.totalLiabilitiesAndEquity).toBe(0.3);
      expect(h.isBalanced).toBe(true);
      expect(h.netWorkingCapital).toBe(0.2);
      expect(getFinancialHealthSummary({ ...bs, totalEquity: 0.21 }, 0).isBalanced).toBe(false);
    });
  });
});
