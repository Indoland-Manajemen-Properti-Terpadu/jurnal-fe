import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent, within } from '@test-utils';
import type {
  GeneralLedgerAccount,
  GeneralLedgerTransaction,
} from '@/module/reports/domain/generalLedger.types';
import { GeneralLedgerTable } from './GeneralLedgerTable';

const tx = (
  number: string,
  debit: number,
  credit: number,
  balance: number
): GeneralLedgerTransaction => ({
  transactionDate: '2026-11-02T00:00:00.000Z',
  transactionNumber: number,
  description: `Transaksi ${number}`,
  notes: '',
  debit,
  credit,
  balance,
  journalId: `j-${number}`,
});

const account = (overrides: Partial<GeneralLedgerAccount> = {}): GeneralLedgerAccount => ({
  id: 'a1',
  number: '1-10001',
  name: 'Kas Kecil',
  category: 'Kas & Bank',
  isContra: false,
  isHead: false,
  normalBalance: 'debit',
  openingBalance: 1000,
  transactions: [tx('A1', 500, 0, 1500), tx('A2', 0, 200, 1300)],
  periodDebit: 500,
  periodCredit: 200,
  closingBalance: 1300,
  ...overrides,
});

const renderTable = (accounts: GeneralLedgerAccount[], search = '') =>
  render(
    <MemoryRouter>
      <GeneralLedgerTable accounts={accounts} search={search} onSearchChange={vi.fn()} />
    </MemoryRouter>
  );

describe('GeneralLedgerTable', () => {
  it('reads like a printed ledger: the account, its opening balance, its transactions, its closing line', () => {
    renderTable([account()]);
    const rows = screen.getAllByRole('row').map((row) => row.textContent ?? '');
    const at = (text: RegExp) => rows.findIndex((row) => text.test(row));
    expect(at(/\(1-10001\)\s*Kas Kecil/)).toBeLessThan(at(/Saldo Awal/));
    expect(at(/Saldo Awal/)).toBeLessThan(at(/Transaksi A1/));
    expect(at(/Transaksi A1/)).toBeLessThan(at(/Transaksi A2/));
    expect(at(/Transaksi A2/)).toBeLessThan(at(/Kas Kecil \| Saldo Akhir/));
    expect(rows[at(/Kas Kecil \| Saldo Akhir/)]).toMatch(/500/);
    expect(rows[at(/Kas Kecil \| Saldo Akhir/)]).toMatch(/1\.300/);
  });

  it('puts the accounts under the name of their class, in chart order, with no category line', () => {
    renderTable([
      account({ id: 'e', number: '6-10001', name: 'Beban Gaji', category: 'Beban Operasional' }),
      account({ id: 'a', number: '1-10001', name: 'Kas Kecil' }),
    ]);
    const text = document.body.textContent ?? '';
    expect(text.indexOf('Aset')).toBeLessThan(text.indexOf('(1-10001)'));
    expect(text.indexOf('(1-10001)')).toBeLessThan(
      text.indexOf('Beban', text.indexOf('(1-10001)'))
    );
    expect(screen.queryByText(/Kas & Bank/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Beban Operasional/)).not.toBeInTheDocument();
  });

  it('shows an account without movement as its opening and closing lines only', () => {
    renderTable([
      account({ transactions: [], periodDebit: 0, periodCredit: 0, closingBalance: 1000 }),
    ]);
    expect(screen.getByText('Saldo Awal')).toBeInTheDocument();
    expect(screen.getByText(/Kas Kecil \| Saldo Akhir/)).toBeInTheDocument();
    expect(screen.queryByText(/Transaksi [A-Z]\d/)).not.toBeInTheDocument();
  });

  it('draws a negative balance in parentheses, and zero debit and credit as a muted 0', () => {
    renderTable([
      account({
        openingBalance: -500,
        transactions: [tx('A1', 0, 0, -500)],
        periodDebit: 0,
        periodCredit: 0,
        closingBalance: -500,
      }),
    ]);
    expect(screen.getAllByText('(500,00)').length).toBeGreaterThan(0);
    const row = screen.getByText('Transaksi A1').closest('tr')!;
    const cells = within(row).getAllByRole('cell');
    expect(cells[3]).toHaveTextContent('0');
    expect(cells[4]).toHaveTextContent('0');
  });

  it('pages the transactions of one account, 25 at a time, and leaves the others alone', async () => {
    const many = Array.from({ length: 60 }, (_, index) => tx(`T${index + 1}`, 1, 0, index + 1));
    renderTable([
      account({ id: 'big', transactions: many, periodDebit: 60, closingBalance: 1060 }),
      account({ id: 'small', number: '1-10002', name: 'Bank', transactions: [tx('B1', 1, 0, 1)] }),
    ]);
    expect(screen.getByText('Transaksi T25')).toBeInTheDocument();
    expect(screen.queryByText('Transaksi T26')).not.toBeInTheDocument();
    expect(screen.getByText('Menampilkan 1–25 dari 60')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('Transaksi T26')).toBeInTheDocument();
    expect(screen.queryByText('Transaksi T1')).not.toBeInTheDocument();
    expect(screen.getByText('Transaksi B1')).toBeInTheDocument();
  });

  it('says so when no account matches the search', () => {
    renderTable([], 'zzz');
    expect(screen.getByText('Akun Tidak Ditemukan')).toBeInTheDocument();
  });
});
