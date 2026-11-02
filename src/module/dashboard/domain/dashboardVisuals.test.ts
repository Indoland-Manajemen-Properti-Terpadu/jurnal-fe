import { getMonthlyNetSalesTrend, getMonthlyTrend } from './dashboardMetrics';
import type { SaleSummary } from './dashboardTypes';

it('mini chart uses net sales, excludes drafts, and preserves empty months', () => {
  const invoice: SaleSummary = {
    id: 'one',
    transactionNumber: 'INV-1',
    customerName: 'Customer',
    transactionDate: '2026-10-15',
    dueDate: null,
    status: 'PUBLISHED',
    finalAmount: 111,
    netSales: 100,
    paidAmount: 0,
    remainingAmount: 111,
  };
  const sales = [invoice, { ...invoice, id: 'draft', status: 'DRAFT', netSales: 999 }];
  const months = getMonthlyTrend(sales, 2, new Date(2026, 10, 2), 'en');
  expect(getMonthlyNetSalesTrend(sales, months)).toEqual([
    { label: 'Oct 26', value: 100 },
    { label: 'Nov 26', value: 0 },
  ]);
});
