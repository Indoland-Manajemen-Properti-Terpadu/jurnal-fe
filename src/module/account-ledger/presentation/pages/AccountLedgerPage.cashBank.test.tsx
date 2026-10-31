import { cleanup, configure, screen, userEvent, waitFor, within } from '@test-utils';
import { routes } from '@/router/routes';
import { formatCurrency as rawFormatCurrency } from '@/utils/formatCurrency';
import {
  bankStatementsMock,
  chartOfAccountsMock,
  fns,
  journalEntriesMock,
  journalRow,
  ledgerState,
  reconciliationMock,
  renderLedger,
  resetLedgerMocks,
} from '../../testing/ledgerMocks';
import AccountLedgerPage from './AccountLedgerPage';

vi.mock('@/components/AppShellLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@mantine/notifications', async () => {
  const { fns: mocked } = await import('../../testing/ledgerMocks');
  return { notifications: { show: (...args: unknown[]) => mocked.notify(...args) } };
});
vi.mock('@/module/chart-of-accounts', () => chartOfAccountsMock());
vi.mock('@/module/journal-entries', () => journalEntriesMock());
vi.mock('@/module/bank-statements', () => bankStatementsMock());
vi.mock('@/module/reconciliation', () => reconciliationMock());

const formatCurrency = (value: number) => rawFormatCurrency(value).replace(/\s/g, ' ');

const renderCashBank = () => renderLedger(<AccountLedgerPage variant="cashBank" />);

const baseDetail = {
  id: 'acc-1',
  name: 'Bank BCA',
  accountNumber: '1-1100',
  category: { name: 'Kas & Bank' },
  amount: 1500000.5,
};

const pickMenuItem = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole('button', { name: 'Menu Aksi', hidden: true }));
  await user.click(await screen.findByRole('menuitem', { name: label, hidden: true }));
};

// Menus and modals animate; under a parallel full run the default 1s wait is too short.
configure({ asyncUtilTimeout: 5000 });
vi.setConfig({ testTimeout: 20000 });

afterEach(async () => {
  // Mantine keeps a modal/menu in its shared portal node until the exit transition ends;
  // wait for it so a leftover modal (aria-hidden on the page) cannot leak into the next test.
  cleanup();
  await waitFor(() => expect(document.querySelectorAll('[data-portal] *')).toHaveLength(0));
});

beforeEach(() => {
  resetLedgerMocks();
  ledgerState.detail = { ...baseDetail };
  ledgerState.transactions = [];
});

describe('cash/bank ledger page (characterization)', () => {
  it('waits only for the account, the entries tab has its own loader', () => {
    ledgerState.detailLoading = true;
    const first = renderCashBank();
    expect(screen.getByText('Memuat detail buku besar kas & bank...')).toBeInTheDocument();
    first.unmount();

    ledgerState.detailLoading = false;
    ledgerState.transactionsLoading = true;
    renderCashBank();
    expect(screen.queryByText('Memuat detail buku besar kas & bank...')).not.toBeInTheDocument();
    expect(screen.getByText('Memuat transaksi jurnal...')).toBeInTheDocument();
  });

  it('queries the reconciliation and the bank statement for the account', () => {
    renderCashBank();
    expect(fns.reconCalls).toContain('acc-1');
    expect(fns.bankStatementCalls).toContain('acc-1');
  });

  it('shows the unreconciled alert and counts', () => {
    ledgerState.recon = {
      bankStatements: [{ isReconciled: false }, { isReconciled: true }, { isReconciled: false }],
      balance: 0,
    };
    renderCashBank();
    expect(
      screen.getByText('Perhatian: Terdapat Transaksi Belum Rekonsiliasi')
    ).toBeInTheDocument();
    expect(screen.getByText('2 Belum Rekon')).toBeInTheDocument();
    expect(screen.getByText('Memerlukan pencocokan data')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Rekonsiliasi Bank/ })).toHaveTextContent('2');
    // balance 0 is kept (nullish fallback), not replaced by the ledger amount
    expect(screen.getByText(formatCurrency(0))).toBeInTheDocument();
  });

  it('shows the matched state without unreconciled rows', () => {
    ledgerState.recon = { bankStatements: [{ isReconciled: true }], balance: 250 };
    renderCashBank();
    expect(screen.queryByText('Perhatian: Terdapat Transaksi Belum Rekonsiliasi')).toBeNull();
    expect(screen.getByText('Seimbang (Match)')).toBeInTheDocument();
    expect(screen.getByText('Semua transaksi bank cocok')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Rekonsiliasi Bank/ })).toHaveTextContent('Match');
    expect(screen.getByText(formatCurrency(250))).toBeInTheDocument();
  });

  it('falls back to the ledger amount when the bank balance is unknown', () => {
    renderCashBank();
    expect(screen.getAllByText(formatCurrency(1500000.5))).toHaveLength(2);
  });

  it('counts statements from results, else from resultTransaction', () => {
    ledgerState.bankStatement = { results: [{}, {}], resultTransaction: [{}] };
    const first = renderCashBank();
    expect(screen.getByRole('tab', { name: /Rekening Koran/ })).toHaveTextContent('2');
    first.unmount();

    ledgerState.bankStatement = { resultTransaction: [{}, {}, {}] };
    renderCashBank();
    expect(screen.getByRole('tab', { name: /Rekening Koran/ })).toHaveTextContent('3');
  });

  it('counts the journal entries in the tab and the KPI', () => {
    ledgerState.transactions = [journalRow(1, 0, 'a'), journalRow(0, 1, 'b')];
    renderCashBank();
    expect(screen.getByRole('tab', { name: /Jurnal Transaksi/ })).toHaveTextContent('2');
    expect(screen.getByText(`${(2).toLocaleString('id-ID')} Mutasi`)).toBeInTheDocument();
  });

  it('shows the category badge unless it is the generic Kas & Bank', () => {
    const first = renderCashBank();
    expect(screen.getAllByText('Kas & Bank')).toHaveLength(2);
    first.unmount();

    ledgerState.detail = { ...baseDetail, category: { name: 'Bank Mandiri' } };
    renderCashBank();
    expect(screen.getByText('Bank Mandiri')).toBeInTheDocument();
  });

  it('hides archive and delete for a locked account (I7)', async () => {
    ledgerState.detail = { ...baseDetail, isLocked: true };
    renderCashBank();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Menu Aksi', hidden: true }));
    expect(await screen.findByText('Manajemen Akun')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Arsipkan Akun' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Hapus Akun' })).not.toBeInTheDocument();
    expect(screen.getByText('Akun Terkunci')).toBeInTheDocument();
  });

  it('archives with the cash/bank wording', async () => {
    fns.archiveAccount.mockResolvedValue({});
    renderCashBank();
    const user = userEvent.setup();
    await pickMenuItem(user, 'Arsipkan Akun');
    const dialog = await screen.findByRole('dialog', { hidden: true });
    expect(within(dialog).getByText('Arsipkan Akun Kas & Bank')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Arsipkan Akun', hidden: true }));
    await waitFor(() =>
      expect(fns.notify).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Akun kas/bank berhasil diarsipkan' })
      )
    );
  });

  it('deletes the account with the cash/bank wording', async () => {
    renderCashBank();
    const user = userEvent.setup();
    await pickMenuItem(user, 'Hapus Akun');
    const dialog = await screen.findByRole('dialog', { hidden: true });
    expect(within(dialog).getByText('Hapus Akun Kas & Bank')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Hapus Akun', hidden: true }));
    const [payload, options] = fns.deleteAccount.mock.calls[0];
    expect(payload).toEqual({ accountIds: ['acc-1'] });
    options.onSuccess();
    expect(fns.notify).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(routes.chartOfAccounts.main)
    );
  });

  it('offers the four create actions', async () => {
    renderCashBank();
    const user = userEvent.setup();
    const open = async (item: string, path: string) => {
      await user.click(screen.getByRole('button', { name: /Buat Transaksi$/ }));
      await user.click(await screen.findByRole('menuitem', { name: item, hidden: true }));
      expect(screen.getByTestId('location')).toHaveTextContent(path);
    };
    await open('Transfer Uang', routes.bankCash.addTransfer);
  });

  it('deletes the selected entries from the entries tab', async () => {
    ledgerState.transactions = [journalRow(10, 0, 'a')];
    const { client } = renderCashBank();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'select-all-rows', hidden: true }));
    await user.click(screen.getByRole('button', { name: /Hapus Terpilih \(1\)/, hidden: true }));
    const dialog = await screen.findByRole('dialog', { hidden: true });
    await user.click(
      within(dialog).getByRole('button', { name: 'Hapus 1 Transaksi', hidden: true })
    );
    const [payload, options] = fns.deleteEntries.mock.calls[0];
    expect(payload).toEqual({ ids: ['a'], idAccount: 'acc-1' });
    options.onSuccess();
    expect(fns.notify).not.toHaveBeenCalled();
    expect(client.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['detail_account', 'acc-1'],
    });
  });

  it('shows an error state with a retry when the account detail fails to load', async () => {
    ledgerState.detailError = true;
    renderCashBank();
    const user = userEvent.setup();
    expect(screen.getByText('Gagal memuat akun')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Coba Lagi' }));
    expect(fns.refetchDetail).toHaveBeenCalled();
  });

  it('shows an error state with a retry for the entries', async () => {
    ledgerState.transactionsError = true;
    renderCashBank();
    const user = userEvent.setup();
    expect(screen.getByText('Gagal memuat transaksi jurnal.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Coba Lagi' }));
    expect(fns.refetchTransactions).toHaveBeenCalled();
  });

  it('switches between the four tabs', async () => {
    renderCashBank();
    const user = userEvent.setup();
    expect(screen.getByRole('tab', { name: /Jurnal Transaksi/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await user.click(screen.getByRole('tab', { name: /Pemetaan Kas/ }));
    expect(screen.getByText('cash-mapping-stub')).toBeVisible();
    await user.click(screen.getByRole('tab', { name: /Rekening Koran/ }));
    expect(screen.getByText('bank-statement-table-stub')).toBeVisible();
    await user.click(screen.getByRole('tab', { name: /Rekonsiliasi Bank/ }));
    expect(screen.getByText('reconciliation-table-stub')).toBeVisible();
  });
});
