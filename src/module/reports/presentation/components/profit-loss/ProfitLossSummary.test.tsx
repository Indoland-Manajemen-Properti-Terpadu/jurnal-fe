import { render, screen } from '@test-utils';
import type { ProfitLossReport } from '@/module/reports/domain/profitLoss.types';
import { ProfitLossSummary } from './ProfitLossSummary';

const report = (summary: Partial<ProfitLossReport['summary']>): ProfitLossReport => ({
  startDate: '2026-11-01',
  endDate: '2026-11-10',
  sections: [],
  rows: [],
  summary: {
    grossRevenue: 1000,
    totalContra: 0,
    netRevenue: 1000,
    totalRevenue: 1000,
    totalDirectCost: 0,
    grossProfit: 1000,
    totalOpex: 400,
    profitAfterOpex: 600,
    totalOtherIncome: 0,
    totalOtherExpense: 0,
    profitNett: 600,
    totalTaxes: 0,
    profitAfterTax: 600,
    ...summary,
  },
});

describe('ProfitLossSummary', () => {
  it('shows net revenue, and says nothing about discounts when there are none', () => {
    render(<ProfitLossSummary report={report({})} />);
    expect(screen.getByText('Pendapatan Bersih')).toBeInTheDocument();
    expect(screen.getByText('Semua pendapatan usaha')).toBeInTheDocument();
    expect(screen.getAllByText(/60% dari pendapatan/)).toHaveLength(2);
  });

  it('shows gross revenue less discounts and returns when there are some', () => {
    render(
      <ProfitLossSummary
        report={report({ grossRevenue: 1200, totalContra: -200, netRevenue: 1000 })}
      />
    );
    expect(
      screen.getByText(/Bruto Rp\s?1\.200,00 dikurangi diskon dan retur -Rp\s?200,00/)
    ).toBeInTheDocument();
  });
});
