import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import type { JournalHistoryEntry, JournalHistoryPage as Page } from '../../domain/journalHistory';
import JournalHistoryPage from './JournalHistoryPage';

const state = {
  data: undefined as Page | undefined,
  isError: false,
  rights: { read: true, delete: true },
};
const voidMutateAsync = vi.fn().mockResolvedValue({});

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../hooks/useJournalHistory', () => ({
  useJournalHistory: () => ({
    data: state.data,
    isLoading: false,
    isFetching: false,
    isError: state.isError,
    refetch: vi.fn(),
  }),
}));
vi.mock('../hooks/useExportJournals', () => ({
  useExportJournals: () => ({ exportJournals: vi.fn(), isExporting: false, cancel: vi.fn() }),
}));
vi.mock('../hooks/useVoidJournalEntry', () => ({
  useVoidJournalEntry: () => ({ mutateAsync: voidMutateAsync, isPending: false }),
}));
vi.mock('@/module/chart-of-accounts', () => ({ useSimpleAccounts: () => ({ accounts: [] }) }));
vi.mock('@/module/user-management', () => ({
  useMyGrants: () => ({
    isReady: true,
    can: (_menu: string, type: 'read' | 'delete') => state.rights[type],
  }),
}));

// jsdom has no layout, so the data table renders no rows; this stand-in draws the same columns,
// the expanded lines and the empty text.
vi.mock('mantine-datatable', () => ({
  DataTable: ({
    columns,
    records,
    emptyState,
    rowExpansion,
  }: {
    columns: {
      accessor: string;
      title: React.ReactNode;
      render?: (row: never) => React.ReactNode;
    }[];
    records: { id: string }[];
    emptyState: React.ReactNode;
    rowExpansion: {
      expanded: { recordIds: string[] };
      content: (args: { record: never }) => React.ReactNode;
    };
  }) =>
    records.length === 0 ? (
      <div>{emptyState}</div>
    ) : (
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessor}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <>
              <tr key={record.id}>
                {columns.map((column) => (
                  <td key={column.accessor}>{column.render?.(record as never)}</td>
                ))}
              </tr>
              {rowExpansion.expanded.recordIds.includes(record.id) && (
                <tr key={`${record.id}-lines`}>
                  <td>{rowExpansion.content({ record: record as never })}</td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    ),
}));

const entry = (overrides: Partial<JournalHistoryEntry> = {}): JournalHistoryEntry => ({
  id: 'j1',
  transactionNumber: '31294',
  transactionDate: '2026-11-04T00:00:00.000Z',
  transactionType: 'DEFAULT',
  status: 'ACTIVE',
  notes: 'Setoran modal',
  sourceType: null,
  tags: [],
  lines: [
    {
      id: 'l1',
      accountId: 'a1',
      accountNumber: '1-100',
      accountName: 'Kas',
      description: '',
      debit: 1000,
      credit: 0,
    },
    {
      id: 'l2',
      accountId: 'a2',
      accountNumber: '3-100',
      accountName: 'Modal',
      description: '',
      debit: 0,
      credit: 1000,
    },
  ],
  totalDebit: 1000,
  totalCredit: 1000,
  canVoid: true,
  voidBlockedReason: null,
  ...overrides,
});

const page = (entries: JournalHistoryEntry[]): Page => ({
  entries,
  page: 1,
  limit: 25,
  totalPages: 1,
  total: entries.length,
});

const renderPage = (url = '/journal-entries') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <JournalHistoryPage />
    </MemoryRouter>
  );

beforeEach(() => {
  state.data = page([entry()]);
  state.isError = false;
  state.rights = { read: true, delete: true };
  voidMutateAsync.mockClear();
});

describe('general journal list', () => {
  it('shows the entry and expands its debit and credit lines', async () => {
    renderPage();
    expect(await screen.findByText('#31294')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /lihat baris debit dan kredit/i }));
    expect(screen.getByText('1-100')).toBeInTheDocument();
  });

  it('has the same report toolbar as the other reports, with an export menu', async () => {
    renderPage();
    expect(await screen.findByText('Bulan Ini')).toBeInTheDocument();
    expect(screen.queryByText('Semua Periode')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Segarkan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cetak Laporan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ekspor' })).toBeInTheDocument();
  });

  it('offers the void only when the server allows it, and asks to confirm first', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Aksi jurnal' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Batalkan jurnal' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Batalkan Jurnal' }));
    expect(voidMutateAsync).toHaveBeenCalledWith({ id: 'j1', number: '31294' });
  });

  it.each([
    ['the server says canVoid is false', { canVoid: false, voidBlockedReason: 'Periode ditutup' }],
    ['the entry is already void', { status: 'VOID', canVoid: false }],
    ['the entry is a reversal', { status: 'REVERSAL', canVoid: false }],
  ])('has no void item when %s', async (_name, overrides) => {
    state.data = page([entry(overrides)]);
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Aksi jurnal' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Lihat rincian jurnal' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Batalkan jurnal' })).not.toBeInTheDocument();
  });

  it('has no void item without the delete right', async () => {
    state.rights.delete = false;
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Aksi jurnal' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Lihat rincian jurnal' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Batalkan jurnal' })).not.toBeInTheDocument();
  });

  it('says so when a filter leaves nothing', () => {
    state.data = page([]);
    renderPage('/journal-entries?status=VOID');
    expect(screen.getByText('Tidak ada jurnal yang cocok')).toBeInTheDocument();
  });

  it('shows an error with a retry when the first load fails', () => {
    state.data = undefined;
    state.isError = true;
    renderPage();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });

  it('shows a notice instead of the list without the read right', () => {
    state.rights.read = false;
    renderPage();
    expect(screen.queryByText('#31294')).not.toBeInTheDocument();
  });
});
