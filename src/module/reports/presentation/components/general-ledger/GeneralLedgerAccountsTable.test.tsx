import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import type { GeneralLedgerAccount } from '@/module/reports/domain/generalLedger.types';
import { GeneralLedgerAccountsTable } from './GeneralLedgerAccountsTable';

const account = (overrides: Partial<GeneralLedgerAccount>): GeneralLedgerAccount => ({
  id: 'a1',
  number: '1-10000',
  name: 'Kas dan Setara Kas',
  category: 'Kas & Bank',
  isContra: false,
  isHead: false,
  normalBalance: 'debit',
  openingBalance: 1000,
  transactions: [
    {
      transactionDate: '2026-11-02T00:00:00.000Z',
      transactionNumber: '31311',
      description: 'Pembayaran pembelian',
      notes: '',
      debit: 500,
      credit: 0,
      balance: 1500,
      journalId: 'j1',
    },
  ],
  periodDebit: 500,
  periodCredit: 0,
  closingBalance: 1500,
  ...overrides,
});

const renderTable = (accounts: GeneralLedgerAccount[], search = '') =>
  render(
    <MemoryRouter>
      <GeneralLedgerAccountsTable
        accounts={accounts}
        period={{ startDate: '2026-11-01', endDate: '2026-11-05' }}
        search={search}
        onSearchChange={vi.fn()}
        pagination={{ page: 1, limit: 20, totalAccounts: 2, totalPages: 1 }}
        onPageChange={vi.fn()}
        isPageLoading={false}
      />
    </MemoryRouter>
  );

describe('GeneralLedgerAccountsTable', () => {
  it('lists every account as a row with its figures', () => {
    renderTable([account({}), account({ id: 'a2', number: '1-10001', name: 'Kas Kecil' })]);
    expect(screen.getByText('Kas dan Setara Kas')).toBeInTheDocument();
    expect(screen.getByText('Kas Kecil')).toBeInTheDocument();
    expect(screen.getAllByText(/1\.500/).length).toBeGreaterThan(0);
  });

  it('shows the transactions of an account only after its row is opened', async () => {
    renderTable([account({})]);
    expect(screen.queryByText('Pembayaran pembelian')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Kas dan Setara Kas/ }));
    expect(await screen.findByText('Pembayaran pembelian')).toBeInTheDocument();
  });

  it('says so when no account matches the search', () => {
    renderTable([], 'zzz');
    expect(screen.getByText('Akun Tidak Ditemukan')).toBeInTheDocument();
  });
});
