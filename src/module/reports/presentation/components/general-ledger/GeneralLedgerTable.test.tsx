import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent, within } from '@test-utils';
import type { GeneralLedgerAccount } from '@/module/reports/domain/generalLedger.types';
import { selectLedgerAccounts } from '@/module/reports/domain/generalLedgerView';
import { GeneralLedgerTable } from './GeneralLedgerTable';

const account = (overrides: Partial<GeneralLedgerAccount> = {}): GeneralLedgerAccount => ({
  id: 'a1',
  number: '1-10001',
  name: 'Kas Kecil',
  category: 'Kas & Bank',
  isContra: false,
  isHead: false,
  normalBalance: 'debit',
  openingBalance: 1000,
  transactions: [
    {
      transactionDate: '2026-11-02',
      transactionNumber: '17009',
      description: 'Pembayaran Vendor',
      notes: 'Pelunasan faktur',
      debit: 0,
      credit: 200,
      balance: 800,
      journalId: 'j1',
    },
  ],
  periodDebit: 0,
  periodCredit: 200,
  closingBalance: 800,
  ...overrides,
});

const renderTable = (source: GeneralLedgerAccount[], search = '', hide = true) =>
  render(
    <MemoryRouter>
      <GeneralLedgerTable
        accounts={selectLedgerAccounts(source, search, hide)}
        period={{ startDate: '2026-11-01', endDate: '2026-11-04' }}
        companyName="Demo Site"
        search={search}
        onSearchChange={vi.fn()}
        hideWithoutTransactions={hide}
        onHideWithoutTransactionsChange={vi.fn()}
        debitTotal={200}
        creditTotal={200}
      />
    </MemoryRouter>
  );

describe('GeneralLedgerTable', () => {
  it('groups by category and shows opening, journal, closing, and total rows', () => {
    renderTable([account()]);
    const rows = screen.getAllByRole('row').map((row) => row.textContent ?? '');
    const at = (text: RegExp) => rows.findIndex((row) => text.test(row));
    expect(at(/Kas & Bank/i)).toBeLessThan(at(/Kas Kecil/));
    expect(at(/Kas Kecil/)).toBeLessThan(at(/Saldo awal per/));
    expect(at(/Saldo awal per/)).toBeLessThan(at(/Pembayaran Vendor/));
    expect(at(/Pembayaran Vendor/)).toBeLessThan(at(/Saldo akhir Kas Kecil/));
    expect(at(/Saldo akhir Kas Kecil/)).toBeLessThan(at(/Total mutasi periode/));
    expect(screen.getByRole('link', { name: 'Kas Kecil' })).toHaveAttribute(
      'href',
      expect.stringContaining('from=2026-11-01&to=2026-11-04')
    );
    expect(screen.getByRole('link', { name: '#17009' })).toHaveAttribute(
      'href',
      expect.stringContaining('j1')
    );
  });

  it('keeps closing balance visible when an account is collapsed', async () => {
    renderTable([account()]);
    await userEvent.click(screen.getByRole('button', { name: 'Ciutkan Kas Kecil' }));
    expect(screen.queryByText(/Saldo awal per/)).not.toBeInTheDocument();
    expect(screen.queryByText('Pembayaran Vendor')).not.toBeInTheDocument();
    expect(screen.getByText(/Saldo akhir Kas Kecil/)).toBeInTheDocument();
  });

  it('marks a searched journal and retains the full account closing balance', () => {
    renderTable([account()], '17009');
    expect(screen.getByText('(semua jurnal akun ini)')).toBeInTheDocument();
    expect(screen.queryByText('Total mutasi periode')).not.toBeInTheDocument();
    const closing = screen.getByText(/Saldo akhir Kas Kecil/).closest('tr')!;
    expect(within(closing).getByText('800,00')).toBeInTheDocument();
  });

  it('shows a dash for zero movement and a formatted zero for a zero balance', () => {
    renderTable([
      account({ openingBalance: 0, periodDebit: 0, periodCredit: 0, closingBalance: 0 }),
    ]);
    const closing = screen.getByText(/Saldo akhir Kas Kecil/).closest('tr')!;
    const cells = within(closing).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('–');
    expect(cells[2]).toHaveTextContent('–');
    expect(cells[3]).toHaveTextContent('0,00');
  });
});
