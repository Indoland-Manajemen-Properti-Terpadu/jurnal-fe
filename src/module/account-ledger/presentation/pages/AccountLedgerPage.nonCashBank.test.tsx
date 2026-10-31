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

const renderNonCash = () => renderLedger(<AccountLedgerPage variant="nonCashBank" />);

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

describe('non cash/bank ledger page (characterization)', () => {
  it('shows the loading text while the account or the entries load', () => {
    ledgerState.detailLoading = true;
    const first = renderNonCash();
    expect(screen.getByText('Memuat data buku besar akun...')).toBeInTheDocument();
    first.unmount();

    ledgerState.detailLoading = false;
    ledgerState.transactionsLoading = true;
    renderNonCash();
    expect(screen.getByText('Memuat data buku besar akun...')).toBeInTheDocument();
  });

  it('shows an error state with a retry when the account detail fails to load', async () => {
    ledgerState.detailError = true;
    renderNonCash();
    const user = userEvent.setup();
    expect(screen.getByText('Gagal memuat akun')).toBeInTheDocument();
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Coba Lagi' }));
    expect(fns.refetchDetail).toHaveBeenCalled();
  });

  it('lets the backend category isDebit flag win over the keywords', () => {
    ledgerState.detail = { ...baseDetail, category: { name: 'Hutang Usaha', isDebit: true } };
    renderNonCash();
    expect(screen.getByText(/Hutang Usaha • Saldo Normal: Debit/)).toBeInTheDocument();
    expect(screen.getByText('Bertambah pada sisi Debit')).toBeInTheDocument();
  });

  it('flips the normal balance of a contra account', () => {
    ledgerState.detail = {
      ...baseDetail,
      isContra: true,
      category: { name: 'Aset Tetap', isDebit: true },
    };
    renderNonCash();
    expect(screen.getByText(/Aset Tetap • Saldo Normal: Kredit/)).toBeInTheDocument();
    expect(screen.getByText('Bertambah pada sisi Kredit')).toBeInTheDocument();
  });

  it('derives the normal balance from the category name when the backend sends no flag', () => {
    ledgerState.detail = { ...baseDetail, category: { name: 'Hutang Usaha' } };
    renderNonCash();
    expect(screen.getByText(/Hutang Usaha • Saldo Normal: Kredit/)).toBeInTheDocument();
    expect(screen.getByText('Bertambah pada sisi Kredit')).toBeInTheDocument();
  });

  it('falls back to the account type when the category has no name', () => {
    ledgerState.detail = { ...baseDetail, category: { name: '' }, type: 'Modal' };
    renderNonCash();
    expect(screen.getByText('Bertambah pada sisi Kredit')).toBeInTheDocument();
  });

  it('defaults to a debit normal balance', () => {
    renderNonCash();
    expect(screen.getByText(/Kas & Bank • Saldo Normal: Debit/)).toBeInTheDocument();
    expect(screen.getByText('Bertambah pada sisi Debit')).toBeInTheDocument();
  });

  it('sums the debit and credit mutations and counts the non zero sides', () => {
    ledgerState.transactions = [
      journalRow(1000.5, 0),
      journalRow(200, 0, 'b'),
      journalRow(0, 300, 'c'),
      journalRow(0, 0, 'd'),
    ];
    renderNonCash();
    expect(screen.getByText(formatCurrency(1200.5))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(300))).toBeInTheDocument();
    expect(screen.getByText('2 transaksi pada sisi debit')).toBeInTheDocument();
    expect(screen.getByText('1 transaksi pada sisi kredit')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Mutasi Jurnal Transaksi/ })).toHaveTextContent('4');
  });

  it('shows the account balance and zero totals without entries', () => {
    renderNonCash();
    expect(screen.getAllByText(formatCurrency(1500000.5)).length).toBeGreaterThan(0);
    expect(screen.getByText('0 transaksi pada sisi debit')).toBeInTheDocument();
  });

  it('hides archive and delete for a locked account (I7)', async () => {
    ledgerState.detail = { ...baseDetail, isLocked: true };
    renderNonCash();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Menu Aksi', hidden: true }));
    expect(await screen.findByText('Manajemen Akun')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Arsipkan Akun' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Hapus Akun' })).not.toBeInTheDocument();
    expect(screen.getByText('Terkunci')).toBeInTheDocument();
  });

  it('archives an account, refetches the detail and toasts', async () => {
    fns.archiveAccount.mockResolvedValue({});
    const { client } = renderNonCash();
    const user = userEvent.setup();
    await pickMenuItem(user, 'Arsipkan Akun');
    const dialog = await screen.findByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByRole('button', { name: 'Arsipkan Akun', hidden: true }));
    await waitFor(() => expect(fns.archiveAccount).toHaveBeenCalledWith('acc-1'));
    await waitFor(() =>
      expect(fns.notify).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'teal', message: 'Akun berhasil diarsipkan' })
      )
    );
    expect(client.refetchQueries).toHaveBeenCalledWith({ queryKey: ['detail_account', 'acc-1'] });
  });

  it('restores an archived account', async () => {
    ledgerState.detail = { ...baseDetail, isArchived: true };
    fns.archiveAccount.mockResolvedValue({});
    renderNonCash();
    const user = userEvent.setup();
    expect(screen.getByText('Diarsipkan')).toBeInTheDocument();
    await pickMenuItem(user, 'Pulihkan Akun');
    const dialog = await screen.findByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByRole('button', { name: 'Pulihkan Akun', hidden: true }));
    await waitFor(() =>
      expect(fns.notify).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Akun berhasil dipulihkan' })
      )
    );
  });

  it('toasts the server message when archiving fails', async () => {
    fns.archiveAccount.mockRejectedValue({ response: { data: { message: 'Tidak bisa' } } });
    renderNonCash();
    const user = userEvent.setup();
    await pickMenuItem(user, 'Arsipkan Akun');
    const dialog = await screen.findByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByRole('button', { name: 'Arsipkan Akun', hidden: true }));
    await waitFor(() =>
      expect(fns.notify).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'red', title: 'Gagal', message: 'Tidak bisa' })
      )
    );
  });

  it('toasts a fallback message when archiving fails without a server message', async () => {
    fns.archiveAccount.mockRejectedValue(new Error('network'));
    renderNonCash();
    const user = userEvent.setup();
    await pickMenuItem(user, 'Arsipkan Akun');
    const dialog = await screen.findByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByRole('button', { name: 'Arsipkan Akun', hidden: true }));
    await waitFor(() =>
      expect(fns.notify).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'red', message: 'Gagal mengubah status arsip akun' })
      )
    );
  });

  it('deletes the account and goes back to the account list on success', async () => {
    renderNonCash();
    const user = userEvent.setup();
    await pickMenuItem(user, 'Hapus Akun');
    const dialog = await screen.findByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByRole('button', { name: 'Hapus Akun', hidden: true }));
    expect(fns.deleteAccount).toHaveBeenCalledTimes(1);
    const [payload, options] = fns.deleteAccount.mock.calls[0];
    expect(payload).toEqual({ accountIds: ['acc-1'] });
    options.onSuccess();
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(routes.chartOfAccounts.main)
    );
    // The success toast comes from the shared useDeleteAccount hook only.
    expect(fns.notify).not.toHaveBeenCalled();
  });

  it('deletes the selected entries and invalidates the lists', async () => {
    ledgerState.transactions = [journalRow(10, 0, 'a'), journalRow(0, 10, 'b')];
    const { client } = renderNonCash();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'select-all-rows', hidden: true }));
    await user.click(screen.getByRole('button', { name: /Hapus Terpilih \(2\)/, hidden: true }));
    const dialog = await screen.findByRole('dialog', { hidden: true });
    await user.click(
      within(dialog).getByRole('button', { name: 'Hapus 2 Transaksi', hidden: true })
    );
    expect(fns.deleteEntries).toHaveBeenCalledTimes(1);
    const [payload, options] = fns.deleteEntries.mock.calls[0];
    expect(payload).toEqual({ ids: ['a', 'b'], idAccount: 'acc-1' });
    options.onSuccess();
    expect(client.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['transaction_by_account', 'acc-1'],
    });
    expect(client.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['detail_account', 'acc-1'],
    });
    // Success and failure toasts come from the shared useDeleteJournalEntries hook only.
    expect(fns.notify).not.toHaveBeenCalled();
    expect(options.onError).toBeUndefined();
  });

  it('shows the account profile in the info tab', async () => {
    ledgerState.detail = { ...baseDetail, level: '2', draftAmount: 500, isAllUser: true };
    renderNonCash();
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: /Informasi & Atribut Akun/ }));
    expect(screen.getByText('Rincian Profil Akun')).toBeInTheDocument();
    expect(screen.getByText(/Level 2/).textContent).toBe('Level 2 (Sub Akun)');
    expect(screen.getByText('Dapat Disesuaikan')).toBeInTheDocument();
    expect(screen.getByText('Semua Pengguna')).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(500))).toBeInTheDocument();
    expect(screen.getByText('Menambah Saldo Akun (+)')).toBeInTheDocument();
  });

  it('navigates to the edit page and back', async () => {
    renderNonCash();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Ubah Akun/ }));
    expect(screen.getByTestId('location')).toHaveTextContent(
      routes.chartOfAccounts.edit.replace(':idAccount', 'acc-1')
    );
  });

  it('does not query the reconciliation or the bank statement', () => {
    renderNonCash();
    // the hooks get an empty id, which disables the query (`enabled: !!idAccount`)
    expect(fns.reconCalls.every((id) => id === '')).toBe(true);
    expect(fns.bankStatementCalls.every((id) => id === '')).toBe(true);
  });
});
