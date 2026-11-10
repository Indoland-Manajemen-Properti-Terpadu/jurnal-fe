import { vi } from 'vitest';
import { render, screen, userEvent } from '@test-utils';
import type { ProfitLossLine } from '@/module/reports/domain/profitLossRows';
import { ProfitLossTable } from './ProfitLossTable';

const line = (overrides: Partial<ProfitLossLine>): ProfitLossLine => ({
  type: 'account',
  key: null,
  accountId: '',
  groupId: null,
  parentId: null,
  accountNumber: '',
  label: '',
  amount: 0,
  isContra: false,
  ...overrides,
});

const base = {
  accountCount: 2,
  search: '',
  onResetSearch: vi.fn(),
};

describe('ProfitLossTable', () => {
  const lines = [
    line({ type: 'head', accountNumber: '4-10000', label: 'Pendapatan', amount: null }),
    line({ accountNumber: '4-10001', label: 'Penjualan', amount: 500000 }),
    line({ accountNumber: '4-30001', label: 'Retur Penjualan', amount: -2500, isContra: true }),
    line({ type: 'subtotal', label: 'SUB TOTAL', amount: 497500, groupLabel: 'Pendapatan' }),
    line({ type: 'total', label: 'TOTAL PENDAPATAN', amount: 497500, role: 'total.revenue' }),
    line({ type: 'profit', label: 'PROFIT/ LOSS GROSS', amount: -10, role: 'profit.gross' }),
  ];

  it('draws accounts with their number, and uses its own wording for totals and subtotals', () => {
    render(<ProfitLossTable {...base} lines={lines} />);
    expect(screen.getByText('4-10001')).toBeInTheDocument();
    expect(screen.getByText('Penjualan')).toBeInTheDocument();
    expect(screen.getByText('Subtotal Pendapatan')).toBeInTheDocument();
    expect(screen.getByText('Total Pendapatan')).toBeInTheDocument();
    expect(screen.getByText('Laba Kotor')).toBeInTheDocument();
    expect(screen.queryByText('TOTAL PENDAPATAN')).not.toBeInTheDocument();
    expect(screen.queryByText('SUB TOTAL')).not.toBeInTheDocument();
  });

  it('marks an account that stands alone so it is not drawn under the group above it', () => {
    render(
      <ProfitLossTable
        {...base}
        lines={[
          line({ accountNumber: '4-10001', label: 'Penjualan', amount: 5, standalone: false }),
          line({ accountNumber: '4-20013', label: 'Pendapatan sewa', amount: 0, standalone: true }),
        ]}
      />
    );
    expect(screen.getByText('Pendapatan sewa').closest('tr')).toHaveAttribute(
      'data-standalone',
      'true'
    );
    expect(screen.getByText('Penjualan').closest('tr')).not.toHaveAttribute('data-standalone');
  });

  it('marks a contra account and shows a negative amount with its sign', () => {
    render(<ProfitLossTable {...base} lines={lines} />);
    expect(screen.getByText('Kontra')).toBeInTheDocument();
    expect(screen.getByText(/-Rp\s?2\.500/)).toBeInTheDocument();
  });

  it('has no switch for empty accounts: what is given is drawn', () => {
    render(<ProfitLossTable {...base} lines={lines} />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('keeps the frame and says so when there is nothing in the period', () => {
    render(<ProfitLossTable {...base} lines={[]} accountCount={0} />);
    expect(screen.getByRole('columnheader', { name: 'Akun' })).toBeInTheDocument();
    expect(screen.getByText('Belum ada transaksi laba rugi')).toBeInTheDocument();
  });

  it('offers to clear a search that finds nothing', async () => {
    const onResetSearch = vi.fn();
    render(
      <ProfitLossTable
        {...base}
        lines={[]}
        accountCount={0}
        search="zzz"
        onResetSearch={onResetSearch}
      />
    );
    expect(screen.getByText('Akun tidak ditemukan')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reset Pencarian' }));
    expect(onResetSearch).toHaveBeenCalledOnce();
  });
});
