import { describe, expect, it } from 'vitest';
import {
  getCashBalance,
  getFinancialHealthSummary,
  getMonthlyTrend,
  getReceivableAging,
  getSalesKpis,
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
});
