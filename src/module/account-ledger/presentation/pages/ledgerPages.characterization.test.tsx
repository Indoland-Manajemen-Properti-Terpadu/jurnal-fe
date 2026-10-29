import { screen, userEvent, waitFor, within } from '@test-utils';
import { routes } from '@/router/routes';
import { formatCurrency as rawFormatCurrency } from '@/utils/FormatCurrency';
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
import DetailAccountPage from './DetailAccountPage';
import DetailAccountNonCashBankPage from './DetailAccountNonCashBankPage';

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

const renderCashBank = () => renderLedger(<DetailAccountPage />);
const renderNonCash = () => renderLedger(<DetailAccountNonCashBankPage />);

const baseDetail = {
  id: 'acc-1',
  name: 'Bank BCA',
  accountNumber: '1-1100',
  category: { name: 'Kas & Bank' },
  amount: 1500000.5,
};

const pickMenuItem = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByRole('button', { name: 'Menu Aksi' }));
  await user.click(await screen.findByRole('menuitem', { name: label }));
};

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

  it('derives the normal balance from the category name (keyword fallback, no backend flag)', () => {
    ledgerState.detail = { ...baseDetail, category: { name: 'Hutang Usaha', isDebit: true } };
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
    await user.click(screen.getByRole('button', { name: 'Menu Aksi' }));
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
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Arsipkan Akun' }));
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
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Pulihkan Akun' }));
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
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Arsipkan Akun' }));
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
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Arsipkan Akun' }));
    await waitFor(() =>
      expect(fns.notify).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'red', message: 'Gagal mengubah status arsip akun' })
      )
    );
  });

  it('deletes the account, toasts and goes back to the account list on success', async () => {
    renderNonCash();
    const user = userEvent.setup();
    await pickMenuItem(user, 'Hapus Akun');
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Hapus Akun' }));
    expect(fns.deleteAccount).toHaveBeenCalledTimes(1);
    const [payload, options] = fns.deleteAccount.mock.calls[0];
    expect(payload).toEqual({ accountIds: ['acc-1'] });
    options.onSuccess();
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(routes.generalJournal.main)
    );
    expect(fns.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Akun Berhasil Dihapus',
        message: 'Akun Bank BCA telah berhasil dihapus.',
      })
    );
  });

  it('deletes the selected entries and invalidates the lists', async () => {
    ledgerState.transactions = [journalRow(10, 0, 'a'), journalRow(0, 10, 'b')];
    const { client } = renderNonCash();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'select-all-rows' }));
    await user.click(screen.getByRole('button', { name: /Hapus Terpilih \(2\)/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Hapus 2 Transaksi' }));
    expect(fns.deleteEntries).toHaveBeenCalledTimes(1);
    const [payload, options] = fns.deleteEntries.mock.calls[0];
    expect(payload).toEqual({ ids: ['a', 'b'], idAccount: 'acc-1' });
    options.onSuccess();
    expect(fns.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Transaksi Berhasil Dihapus',
        message: '2 transaksi jurnal telah dihapus.',
      })
    );
    expect(client.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['transaction_by_account', 'acc-1'],
    });
    expect(client.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['detail_account', 'acc-1'],
    });
    options.onError({ response: { data: { message: 'ditolak' } } });
    expect(fns.notify).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', message: 'ditolak' })
    );
    options.onError(new Error('x'));
    expect(fns.notify).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Terjadi kesalahan saat menghapus transaksi.' })
    );
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
      routes.generalJournal.editAccountJournal.replace(':idAccount', 'acc-1')
    );
  });

  it('does not query the reconciliation or the bank statement', () => {
    renderNonCash();
    expect(fns.reconCalls).toEqual([]);
    expect(fns.bankStatementCalls).toEqual([]);
  });
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
    await user.click(screen.getByRole('button', { name: 'Menu Aksi' }));
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
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Arsipkan Akun Kas & Bank')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Arsipkan Akun' }));
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
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Hapus Akun Kas & Bank')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Hapus Akun' }));
    const [payload, options] = fns.deleteAccount.mock.calls[0];
    expect(payload).toEqual({ accountIds: ['acc-1'] });
    options.onSuccess();
    expect(fns.notify).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Akun Bank BCA telah dihapus dari sistem.' })
    );
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(routes.generalJournal.main)
    );
  });

  it('offers the four create actions', async () => {
    renderCashBank();
    const user = userEvent.setup();
    const open = async (item: string, path: string) => {
      await user.click(screen.getByRole('button', { name: /Buat Transaksi$/ }));
      await user.click(await screen.findByRole('menuitem', { name: item }));
      expect(screen.getByTestId('location')).toHaveTextContent(path);
    };
    await open('Transfer Uang', routes.BankAndCash.AddTransferMoney);
  });

  it('deletes the selected entries from the entries tab', async () => {
    ledgerState.transactions = [journalRow(10, 0, 'a')];
    const { client } = renderCashBank();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'select-all-rows' }));
    await user.click(screen.getByRole('button', { name: /Hapus Terpilih \(1\)/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Hapus 1 Transaksi' }));
    const [payload, options] = fns.deleteEntries.mock.calls[0];
    expect(payload).toEqual({ ids: ['a'], idAccount: 'acc-1' });
    options.onSuccess();
    expect(fns.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Berhasil Menghapus Transaksi',
        message: '1 transaksi terpilih telah berhasil dihapus.',
      })
    );
    expect(client.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['detail_account', 'acc-1'],
    });
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
