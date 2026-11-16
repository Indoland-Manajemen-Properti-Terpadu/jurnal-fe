import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent, within } from '@test-utils';
import { acc, demoTree } from '@/module/bank-cash/domain/cashBankAccounts.fixture';
import { TableBankCash } from '@/module/bank-cash/presentation/components/accounts-table/TableBankCash';
import type { PettyCashAccountIndex } from '@/module/bank-cash/domain/cashBankAccounts';

const petty: PettyCashAccountIndex = new Map([
  ['a2', { fundId: 'f1', fundName: 'Kas Kecil Test' }],
]);

const renderTable = (props: Partial<React.ComponentProps<typeof TableBankCash>> = {}) =>
  render(
    <MemoryRouter>
      <TableBankCash
        accounts={demoTree()}
        pettyCashIndex={petty}
        showArchived={false}
        onShowArchivedChange={() => undefined}
        {...props}
      />
    </MemoryRouter>
  );

describe('TableBankCash', () => {
  it('lists the six real accounts and the header only as a group title', () => {
    renderTable();
    expect(screen.getAllByText('1-10001').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1-10099').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Kas dan Setara Kas')).toHaveLength(1);
    expect(screen.queryByText('1-10000')).toBeNull();
  });

  it('has no bank or cash tabs', () => {
    renderTable();
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('tells a petty cash account apart by its icon, without a badge or a link', () => {
    renderTable();
    expect(screen.getAllByLabelText('Kas kecil')).toHaveLength(1);
    expect(screen.queryByText('Kas kecil')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('offers the petty cash actions in the menu of a petty cash account', async () => {
    renderTable();
    const row = screen.getAllByText('1-10002')[0].closest('tr') as HTMLElement;
    await userEvent.click(within(row).getByRole('button', { name: 'Aksi' }));
    expect(await screen.findByText('Buka kas kecil')).toBeTruthy();
    expect(screen.queryByText('Transfer dari Akun Ini')).toBeNull();
  });

  it('hides archived accounts until the switch is on', () => {
    const tree = demoTree();
    tree[0].subAccount!.push(
      acc({ id: 'old', accountNumber: '1-10777', name: 'Rekening Lama', isArchived: true })
    );
    const { unmount } = renderTable({ accounts: tree });
    expect(screen.queryByText('Rekening Lama')).toBeNull();
    unmount();
    renderTable({ accounts: tree, showArchived: true });
    expect(screen.getByText('Rekening Lama')).toBeTruthy();
    expect(screen.getByText('Diarsipkan')).toBeTruthy();
  });

  it('reports the switch change', async () => {
    const onChange = vi.fn();
    renderTable({ onShowArchivedChange: onChange });
    await userEvent.click(screen.getByRole('switch', { name: /diarsipkan/i }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('tells apart no accounts at all from a search without match', async () => {
    const { unmount } = renderTable({ accounts: [] });
    expect(screen.getByText('Belum Ada Akun Kas & Bank')).toBeTruthy();
    unmount();
    renderTable();
    await userEvent.type(screen.getByPlaceholderText(/Cari/), 'zzzz');
    expect(screen.getByText(/tidak ada akun/i)).toBeTruthy();
  });

  it('shows only two kinds of account and says nothing about a lock', async () => {
    const tree = demoTree();
    tree[0].subAccount!.push(
      acc({
        id: 'lk',
        accountNumber: '1-10555',
        name: 'Rekening Terkunci',
        isLocked: 'true' as never,
      })
    );
    renderTable({ accounts: tree });
    expect(screen.queryByLabelText('Terkunci')).toBeNull();
    expect(screen.getAllByLabelText('Kas kecil')).toHaveLength(1);
    expect(screen.getAllByLabelText('Akun kas/bank')).toHaveLength(6);

    const row = screen.getByText('Rekening Terkunci').closest('tr') as HTMLElement;
    await userEvent.click(within(row).getByRole('button', { name: 'Aksi' }));
    expect(await screen.findByText('Transfer dari Akun Ini')).toBeTruthy();
  });

  it('says nothing matches, not "no accounts yet", when the switch hides every account', () => {
    const tree = [
      acc({ id: 'only', accountNumber: '1-10001', name: 'Rekening Lama', isArchived: true }),
    ];
    renderTable({ accounts: tree });
    expect(screen.getByText('Tidak ada akun yang sesuai')).toBeTruthy();
    expect(screen.queryByText('Belum Ada Akun Kas & Bank')).toBeNull();
  });

  describe('bank connection', () => {
    const connected = () => {
      const tree = demoTree();
      tree[0].subAccount![2] = {
        ...tree[0].subAccount![2],
        bankConnection: {
          id: 'bc_1',
          status: 'ACTIVE',
          bankName: 'Bank Contoh',
          statementBalance: 127_500_000,
          statementBalanceAsOf: '2026-11-12T03:05:00Z',
        },
      };
      return tree;
    };

    const openMenu = async (code: string) => {
      const row = screen.getAllByText(code)[0].closest('tr') as HTMLElement;
      await userEvent.click(within(row).getByRole('button', { name: 'Aksi' }));
    };

    it('adds no column while no account is connected, and offers to connect a plain account', async () => {
      renderTable();
      expect(screen.queryByText('Saldo rekening koran')).toBeNull();
      await openMenu('1-10001');
      expect(await screen.findByText('Hubungkan ke bank')).toBeTruthy();
    });

    it('shows the bank balance and the connection status once an account is connected', () => {
      renderTable({ accounts: connected() });
      expect(screen.getByText('Saldo rekening koran')).toBeTruthy();
      expect(screen.getByText('Koneksi bank')).toBeTruthy();
      expect(screen.getByText(/127\.500\.000/)).toBeTruthy();
      expect(screen.getByText('Aktif')).toBeTruthy();
    });

    it('offers to manage, not to connect, an account that is already connected', async () => {
      renderTable({ accounts: connected() });
      await openMenu('1-10003');
      expect(await screen.findByText('Kelola koneksi bank')).toBeTruthy();
      expect(screen.queryByText('Hubungkan ke bank')).toBeNull();
    });

    it('does not offer to connect a petty cash account', async () => {
      renderTable();
      await openMenu('1-10002');
      expect(await screen.findByText('Buka kas kecil')).toBeTruthy();
      expect(screen.queryByText('Hubungkan ke bank')).toBeNull();
    });
  });
});
