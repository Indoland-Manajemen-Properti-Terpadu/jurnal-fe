import { render, screen, within } from '@test-utils';
import type { TrialBalanceReport } from '@/module/reports/domain/trialBalance.types';
import { TrialBalanceSummary } from './TrialBalanceSummary';

const sums = (debit: number, credit: number) => ({ debit, credit });
const report = (closing = sums(1000, 1000), profit = 300): TrialBalanceReport => ({
  startDate: '2026-11-01',
  endDate: '2026-11-30',
  accounts: [],
  totals: {
    opening: sums(200, 200),
    movement: sums(500, 500),
    closing,
    profitLoss: sums(100, 400),
    balanceSheet: sums(0, 0),
  },
  balancing: { profitLoss: sums(0, 0), balanceSheet: sums(0, 0) },
  profit,
  pagination: { page: 1, limit: 100, totalRows: 3, totalPages: 1 },
});

const card = (name: RegExp) => screen.getByRole('group', { name });

describe('TrialBalanceSummary', () => {
  it('shows one card per column group, in the table order and with its names', () => {
    render(<TrialBalanceSummary report={report()} />);
    const names = screen.getAllByRole('group').map((group) => group.getAttribute('aria-label'));
    expect(names.map((name) => name?.split(':')[0])).toEqual([
      'Saldo Awal',
      'Mutasi',
      'Saldo Akhir',
      'Laba Rugi',
    ]);
  });

  it('gives every card the same parts: debit, kredit and a closing line', () => {
    render(<TrialBalanceSummary report={report()} />);
    for (const group of screen.getAllByRole('group')) {
      expect(within(group).getByText('Debit')).toBeInTheDocument();
      expect(within(group).getByText('Kredit')).toBeInTheDocument();
    }
  });

  it('ends the first three cards with the difference and the last with the profit', () => {
    render(<TrialBalanceSummary report={report()} />);
    expect(within(card(/^Saldo Akhir/)).getByText('Selisih')).toBeInTheDocument();
    expect(within(card(/^Laba Rugi/)).getByText('Laba Berjalan')).toBeInTheDocument();
    expect(within(card(/^Laba Rugi/)).getByText(/300/)).toBeInTheDocument();
  });

  it('draws a difference red only when debit and credit really differ', () => {
    const { unmount } = render(<TrialBalanceSummary report={report()} />);
    const balanced = within(card(/^Saldo Akhir/)).getByText(/Rp\s*0$/);
    expect(balanced.className).not.toMatch(/red/);
    unmount();

    render(<TrialBalanceSummary report={report(sums(1000, 900))} />);
    const gap = within(card(/^Saldo Akhir/)).getByText(/100/);
    expect(gap).toHaveStyle({ color: 'var(--mantine-color-red-7)' });
  });
});
