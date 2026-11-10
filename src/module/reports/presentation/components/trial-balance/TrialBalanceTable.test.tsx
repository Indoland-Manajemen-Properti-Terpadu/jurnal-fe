import { render, screen, within } from '@test-utils';
import type {
  TrialBalanceAccount,
  TrialBalanceReport,
} from '@/module/reports/domain/trialBalance.types';
import {
  detailTrialBalanceAccounts,
  groupTrialBalanceAccounts,
} from '@/module/reports/domain/trialBalance';
import { TrialBalanceTable } from './TrialBalanceTable';

const account = (overrides: Partial<TrialBalanceAccount>): TrialBalanceAccount => ({
  id: 'a',
  accountNumber: '1-10001',
  name: 'Kas Kecil',
  categoryName: 'Kas & Bank',
  isHead: false,
  isContra: false,
  opening: { debit: 5000, credit: null },
  movement: { debit: 0, credit: null },
  closing: { debit: 5000, credit: null },
  profitLoss: null,
  balanceSheet: { debit: 5000, credit: null },
  ...overrides,
});

const sums = (debit: number, credit: number) => ({ debit, credit });
const report: TrialBalanceReport = {
  startDate: '2026-11-01',
  endDate: '2026-11-30',
  accounts: [],
  totals: {
    opening: sums(5000, 5000),
    movement: sums(0, 0),
    closing: sums(5000, 5000),
    profitLoss: sums(100, 200),
    balanceSheet: sums(4900, 4800),
  },
  balancing: { profitLoss: sums(100, 0), balanceSheet: sums(0, 100) },
  profit: 100,
  pagination: { page: 1, limit: 100, totalRows: 2, totalPages: 1 },
};

const renderTable = (accounts: TrialBalanceAccount[], search = '') =>
  render(
    <TrialBalanceTable
      report={report}
      sections={groupTrialBalanceAccounts(detailTrialBalanceAccounts(accounts))}
      accountCount={accounts.length}
      search={search}
      onResetSearch={vi.fn()}
    />
  );

describe('TrialBalanceTable', () => {
  it('shows the five column groups and a debit and credit column under each', () => {
    renderTable([account({})]);
    for (const name of ['Saldo Awal', 'Mutasi', 'Saldo Akhir', 'Laba Rugi', 'Neraca']) {
      expect(screen.getByRole('columnheader', { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('columnheader', { name: 'Debit' })).toHaveLength(5);
    expect(screen.getAllByRole('columnheader', { name: 'Kredit' })).toHaveLength(5);
  });

  it('shows 0 where the server sends no figure, so every account has both sides in every group', () => {
    renderTable([account({})]);
    const cells = within(screen.getByText('Kas Kecil').closest('tr')!).getAllByRole('cell');
    // account, then opening debit/credit, movement debit/credit, ...
    expect(cells[1]).toHaveTextContent('5.000');
    expect(cells[2]).toHaveTextContent('0');
    expect(cells[3]).toHaveTextContent('0');
    expect(cells[4]).toHaveTextContent('0');
    // the profit and loss group of the account is null: both cells show 0
    expect(cells[7]).toHaveTextContent('0');
    expect(cells[8]).toHaveTextContent('0');
  });

  it('shows the total and balancing rows from the report', () => {
    renderTable([account({})]);
    const total = screen.getByText('Total').closest('tr')!;
    expect(within(total).getAllByRole('cell')[7]).toHaveTextContent('100');
    const balancing = screen.getByText('Selisih Penyeimbang').closest('tr')!;
    const cells = within(balancing).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('');
    expect(cells[7]).toHaveTextContent('100');
    expect(cells[10]).toHaveTextContent('100');
  });

  it('groups the accounts under the name of their class, in chart order', () => {
    renderTable([
      account({ id: 'e', accountNumber: '6-10001', name: 'Beban Gaji' }),
      account({ id: 'a', accountNumber: '1-10001', name: 'Kas Kecil' }),
      account({ id: 'l', accountNumber: '2-10001', name: 'Hutang Usaha' }),
    ]);
    const bodyRows = within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row');
    const labels = bodyRows.map((row) => within(row).getAllByRole('cell')[0].textContent);
    expect(labels).toEqual([
      'Aset',
      '1-10001Kas Kecil',
      'Kewajiban',
      '2-10001Hutang Usaha',
      'Beban',
      '6-10001Beban Gaji',
    ]);
  });

  it('does not show a parent account, only the accounts under it and the ones standing alone', () => {
    renderTable([
      account({ id: 'p', accountNumber: '1-10100', name: 'Piutang', isHead: true }),
      account({ id: 's', accountNumber: '1-10101', name: 'Piutang Air' }),
      account({ id: 'x', accountNumber: '1-10200', name: 'Piutang Belum Ditagih' }),
    ]);
    expect(screen.queryByText('Piutang')).not.toBeInTheDocument();
    expect(screen.getByText('Piutang Air')).toBeInTheDocument();
    expect(screen.getByText('Piutang Belum Ditagih')).toBeInTheDocument();
  });

  it('tells an empty report from a search with no match', () => {
    const { unmount } = renderTable([]);
    expect(screen.getByText('Belum ada saldo akun')).toBeInTheDocument();
    unmount();
    renderTable([], 'zzz');
    expect(screen.getByText('Akun tidak ditemukan')).toBeInTheDocument();
  });
});
