import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, userEvent, waitFor } from '@test-utils';
import BankStatementTable from './BankStatementTable';

const state = {
  data: undefined as { results: Record<string, unknown>[] } | undefined,
  isLoading: false,
  isError: false,
};
const deleteMutate = vi.fn();

vi.mock('../hooks/useBankStatement', () => ({
  useBankStatement: () => ({ ...state, refetch: vi.fn() }),
}));
vi.mock('../hooks/useDeleteBankStatement', () => ({
  useDeleteBankStatement: () => ({ mutate: deleteMutate, isPending: false }),
}));
vi.mock('./ImportBankStatementModal', () => ({ default: () => null }));
// jsdom has no layout, so the data table renders no rows; this stand-in draws the same columns.
vi.mock('mantine-datatable', () => ({
  DataTable: ({
    columns,
    records,
  }: {
    columns: { accessor: string; title: string; render?: (row: unknown) => React.ReactNode }[];
    records: unknown[];
  }) => (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.accessor}>{column.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.accessor}>{column.render?.(record)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

const row = (overrides: Record<string, unknown>) => ({
  id: 'r1',
  transactionName: 'SETORAN MODAL',
  transactionDate: '2026-11-01T00:00:00.000Z',
  debit: 1000000,
  credit: 0,
  reconciled: false,
  ...overrides,
});

const renderTable = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/ledger/acc-1']}>
        <Routes>
          <Route path="/ledger/:idAccount" element={<BankStatementTable />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

beforeEach(() => {
  deleteMutate.mockReset();
  state.isLoading = false;
  state.isError = false;
  state.data = {
    results: [
      row({}),
      row({ id: 'r2', transactionName: 'BIAYA ADMIN', debit: 0, credit: 250000 }),
      row({ id: 'r3', transactionName: 'TRF SEWA', reconciled: true, debit: 500000 }),
    ],
  };
});

describe('BankStatementTable', () => {
  it('shows the totals and the number of rows that are not matched', () => {
    renderTable();
    expect(screen.getByText(/3 baris/)).toHaveTextContent('1.500.000,00');
    expect(screen.getByText(/3 baris/)).toHaveTextContent('2 belum dicocokkan');
  });

  it('has no balance column: the old one repeated the received amount', () => {
    renderTable();
    expect(screen.queryByText(/Saldo/)).not.toBeInTheDocument();
    expect(screen.getByText('Diterima (Rp)')).toBeInTheDocument();
    expect(screen.getByText('Dikirim (Rp)')).toBeInTheDocument();
  });

  it('writes the status as a word: matched or not matched', () => {
    renderTable();
    expect(screen.getAllByText('Belum dicocokkan')).toHaveLength(2);
    expect(screen.getByText('Dicocokkan')).toBeInTheDocument();
  });

  it('lets an unmatched row be deleted after a confirmation', async () => {
    renderTable();
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Hapus baris ini' })[0]);
    expect(await screen.findByText('Hapus Baris Rekening Koran')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hapus Baris' }));
    await waitFor(() => expect(deleteMutate).toHaveBeenCalledTimes(1));
    expect(deleteMutate.mock.calls[0][0]).toMatch(/^r[12]$/);
  });

  it('does not let a matched row be deleted', () => {
    renderTable();
    const buttons = screen.getAllByRole('button', { name: 'Hapus baris ini' });
    // newest first, rows of the same day keep the server order: r1, r2, r3
    expect(buttons).toHaveLength(3);
    expect(buttons[2]).toBeDisabled();
    expect(buttons[0]).toBeEnabled();
  });

  it('shows an error state with a retry instead of the empty import state', () => {
    state.isError = true;
    renderTable();
    expect(screen.getByText('Rekening koran belum dapat dimuat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Muat Ulang' })).toBeInTheDocument();
    expect(screen.queryByText('Belum Ada Rekening Koran')).not.toBeInTheDocument();
  });

  it('offers the import when nothing was imported yet', () => {
    state.data = { results: [] };
    renderTable();
    expect(screen.getByText('Belum Ada Rekening Koran')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Impor Rekening Koran' })).toBeInTheDocument();
  });

  it('filters by description and offers a reset when nothing matches', async () => {
    renderTable();
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Cari deskripsi...'), 'zzz');
    expect(await screen.findByText('Tidak ada baris yang sesuai')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Reset Filter' })[0]);
    expect(await screen.findByText('SETORAN MODAL')).toBeInTheDocument();
  });
});
