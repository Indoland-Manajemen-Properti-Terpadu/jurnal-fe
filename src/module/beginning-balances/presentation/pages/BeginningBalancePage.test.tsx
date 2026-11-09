import { vi } from 'vitest';
import { fireEvent, render, screen, userEvent, waitFor, within } from '@test-utils';
import { MemoryRouter } from 'react-router-dom';
import type { DraftBalance, SimpleAccount } from '../../domain/beginningBalance';
import BeginningBalancePage from './BeginningBalancePage';

const state = {
  accounts: [] as SimpleAccount[],
  draft: { status: false } as DraftBalance,
  logs: [] as unknown[],
  locked: false,
};
const saveDraft = vi.fn();
const publish = vi.fn();

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('mantine-datatable', () => ({
  DataTable: ({
    records,
    columns,
  }: {
    records: { id: string }[];
    columns: { accessor: string; render?: (r: never) => React.ReactNode }[];
  }) => (
    <div>
      {records.map((record) => (
        <div key={record.id}>
          {columns.map((col) => (
            <div key={col.accessor}>{col.render ? col.render(record as never) : null}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('../hooks/useDraftBalance', () => ({
  useSimpleAccounts: () => ({
    data: state.accounts,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useDraftAccount: () => ({ draftAccounts: state.draft, isLoading: false, refetch: vi.fn() }),
  useSetDraftBalance: () => ({ mutate: saveDraft, isPending: false }),
  usePublishDraftBalance: () => ({ mutate: publish, isPending: false }),
  useDateLocked: () => ({ data: state.locked }),
  useDraftBalanceLogs: () => ({ data: state.logs, isLoading: false, isError: false }),
}));

const acc = (id: string, accountNumber: string, name: string, type: 'debit' | 'credit') => ({
  id,
  accountNumber,
  name,
  type,
  isContra: false,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <BeginningBalancePage />
    </MemoryRouter>
  );

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  saveDraft.mockReset();
  publish.mockReset();
  state.accounts = [
    acc('kas', '1-10000', 'Kas', 'debit'),
    acc('bank', '1-10001', 'Bank', 'debit'),
    acc('modal', '3-10000', 'Modal', 'credit'),
  ];
  state.draft = { status: false };
  state.logs = [];
  state.locked = false;
});

describe('opening balance page', () => {
  it('lists every account of the simple list', () => {
    renderPage();
    expect(screen.getByLabelText('Debit (Rp) 1-10000')).toBeInTheDocument();
    expect(screen.getByLabelText('Kredit (Rp) 3-10000')).toBeInTheDocument();
    expect(screen.getByText('dari 3 akun')).toBeInTheDocument();
  });

  it('hides save draft and publish before anything is entered', () => {
    renderPage();
    expect(screen.queryByRole('button', { name: 'Simpan Draf' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publikasikan' })).not.toBeInTheDocument();
  });

  it('can save an unbalanced draft, but hides publish', () => {
    renderPage();
    type('Debit (Rp) 1-10000', '1000');
    expect(screen.getByRole('button', { name: 'Simpan Draf' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Publikasikan' })).not.toBeInTheDocument();
    expect(screen.getByText(/Selisih/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Draf' }));
    expect(saveDraft.mock.calls[0][0].balances).toEqual([{ account: 'kas', debit: 1000 }]);
  });

  it('saves only the accounts with an amount, each with one side, without a duplicate list', () => {
    renderPage();
    type('Debit (Rp) 1-10000', '1.000');
    type('Debit (Rp) 1-10001', '500');
    type('Kredit (Rp) 3-10000', '1.500');
    const save = screen.getByRole('button', { name: 'Simpan Draf' });
    expect(save).toBeEnabled();
    fireEvent.click(save);
    expect(saveDraft).toHaveBeenCalledTimes(1);
    const payload = saveDraft.mock.calls[0][0];
    expect(payload).toEqual({
      period: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      balances: [
        { account: 'kas', debit: 1000 },
        { account: 'bank', debit: 500 },
        { account: 'modal', credit: 1500 },
      ],
    });
  });

  it('publishes the same payload after a confirm', async () => {
    renderPage();
    type('Debit (Rp) 1-10000', '2.000');
    type('Kredit (Rp) 3-10000', '2.000');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Publikasikan' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Publikasikan/ }));
    await waitFor(() => expect(publish).toHaveBeenCalledTimes(1));
    expect(publish.mock.calls[0][0].balances).toEqual([
      { account: 'kas', debit: 2000 },
      { account: 'modal', credit: 2000 },
    ]);
  });

  it('shows the saved draft amounts and has no Save Draft button once it is published', () => {
    state.draft = {
      id: 'd1',
      status: true,
      period: '2026-04-07T00:00:00.000Z',
      isPublished: true,
      accounts: [
        { _id: 'kas', debit: 700 },
        { _id: 'modal', credit: 700 },
      ],
    };
    renderPage();
    expect(screen.getByLabelText('Debit (Rp) 1-10000')).toHaveValue('700');
    expect(screen.queryByRole('button', { name: 'Simpan Draf' })).not.toBeInTheDocument();
    // nothing changed yet, so there is nothing to publish again
    expect(
      screen.queryByRole('button', { name: 'Perbarui & Publikasikan' })
    ).not.toBeInTheDocument();
  });

  it('shows the amounts of the last publish when the server has emptied the published draft', () => {
    state.draft = {
      id: 'd1',
      status: true,
      period: '2026-11-01T00:00:00.000Z',
      isPublished: true,
      accounts: [{ _id: 'kas', debit: 0, credit: 0 }],
    };
    state.logs = [
      {
        action: 'PUBLISH',
        createdAt: '2026-11-04T10:00:00.000Z',
        period: '2026-06-30T00:00:00.000Z',
        balances: [
          { account: { id: 'kas' }, debit: 900, credit: 0 },
          { account: { id: 'modal' }, debit: 0, credit: 900 },
        ],
      },
    ];
    renderPage();
    expect(screen.getByLabelText('Debit (Rp) 1-10000')).toHaveValue('900');
    expect(screen.getByLabelText('Kredit (Rp) 3-10000')).toHaveValue('900');
    expect(screen.getByText(/Tanggal konversi 30\/06\/2026/)).toBeInTheDocument();
    // nothing changed yet, so there is nothing to publish again
    expect(
      screen.queryByRole('button', { name: 'Perbarui & Publikasikan' })
    ).not.toBeInTheDocument();
    type('Debit (Rp) 1-10000', '1.000');
    type('Kredit (Rp) 3-10000', '1.000');
    expect(screen.getByRole('button', { name: 'Perbarui & Publikasikan' })).toBeEnabled();
  });

  it('hides save and publish and explains why when the date is in a locked period', () => {
    state.locked = true;
    renderPage();
    type('Debit (Rp) 1-10000', '1.000');
    type('Kredit (Rp) 3-10000', '1.000');
    expect(screen.getByText(/periode akuntansi yang terkunci/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Simpan Draf' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publikasikan' })).not.toBeInTheDocument();
  });

  it('blocks a date after the first transaction when the server sends it', () => {
    state.draft = {
      id: 'd1',
      status: true,
      period: '2026-11-01',
      firstTransactionDate: '2026-07-01T00:00:00.000Z',
      accounts: [],
    };
    renderPage();
    expect(
      screen.getByText(/tidak boleh setelah transaksi pertama \(01\/07\/2026\)/)
    ).toBeInTheDocument();
  });

  it('filters by search and by the filled rows only', () => {
    state.draft = {
      id: 'd1',
      status: true,
      period: '2026-04-07',
      accounts: [{ _id: 'kas', debit: 5 }],
    };
    renderPage();
    fireEvent.change(screen.getByLabelText('Cari kode atau nama akun...'), {
      target: { value: 'modal' },
    });
    expect(screen.getByText('1 dari 3 akun')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cari kode atau nama akun...'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByLabelText('Hanya yang terisi'));
    expect(screen.getByText('1 dari 3 akun')).toBeInTheDocument();
    expect(screen.getByLabelText('Debit (Rp) 1-10000')).toBeInTheDocument();
  });
});
