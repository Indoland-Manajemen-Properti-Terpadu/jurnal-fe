import { render, screen } from '@test-utils';
import type { TrialBalanceReport } from '@/module/reports/domain/trialBalance.types';
import { TrialBalanceSummary } from './TrialBalanceSummary';

const sums = (debit: number, credit: number) => ({ debit, credit });
const report = (movement = sums(500, 500)): TrialBalanceReport => ({
  startDate: '2026-11-01',
  endDate: '2026-11-30',
  accounts: [],
  totals: {
    opening: sums(0, 0),
    movement,
    closing: sums(1000, 900),
    profitLoss: sums(100, 400),
    balanceSheet: sums(0, 0),
  },
  balancing: { profitLoss: sums(0, 0), balanceSheet: sums(0, 0) },
  profit: 300,
  pagination: { page: 1, limit: 100, totalRows: 3, totalPages: 1 },
});

describe('TrialBalanceSummary', () => {
  it('shows four cards: movement, closing debit and credit in one card, revenue, profit', () => {
    render(<TrialBalanceSummary report={report()} />);
    expect(screen.getByText('Total Mutasi')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Debit .*1\.000.*kredit .*900/ })).toBeInTheDocument();
    expect(screen.getByText('Debit')).toBeInTheDocument();
    expect(screen.getByText('Kredit')).toBeInTheDocument();
    expect(screen.getByText('Pendapatan')).toBeInTheDocument();
    expect(screen.getByText(/Beban .*100/)).toBeInTheDocument();
    expect(screen.getByText('Laba Berjalan')).toBeInTheDocument();
    expect(screen.getByText('Margin 75% dari pendapatan')).toBeInTheDocument();
  });

  it('warns on the movement card only when its debit and credit differ', () => {
    const { unmount } = render(<TrialBalanceSummary report={report()} />);
    expect(screen.queryByText(/berbeda/)).not.toBeInTheDocument();
    unmount();
    render(<TrialBalanceSummary report={report(sums(500, 450))} />);
    expect(screen.getByText(/Debit dan kredit berbeda/)).toBeInTheDocument();
  });
});
