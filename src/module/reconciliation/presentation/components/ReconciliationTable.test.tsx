import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import ReconciliationTable from './ReconciliationTable';

const state = {
  recon: undefined as Record<string, unknown> | undefined,
  isLoading: false,
  isError: false,
  imported: 5,
};
const matchSelected = vi.fn();

vi.mock('../hooks/useReconciliation', () => ({
  useReconciliation: () => ({
    data: state.recon,
    isLoading: state.isLoading,
    isError: state.isError,
    refetch: vi.fn(),
  }),
}));
vi.mock('@/module/bank-statements', () => ({
  useBankStatement: () => ({
    data: { results: Array.from({ length: state.imported }, () => ({})) },
  }),
  ImportBankStatementModal: () => null,
}));
vi.mock('./FindAndReconModal', () => ({ FindAndReconModal: () => null }));
vi.mock('../hooks/useMatchReconciliation', () => ({
  useMatchReconciliation: () => ({
    mutate: (payload: unknown) => matchSelected(payload),
    isPending: false,
  }),
}));

const journal = (id: string, debit: number, credit = 0) => ({
  id,
  debit,
  credit,
  transactionDate: '2026-11-01T00:00:00.000Z',
  description: `Jurnal ${id}`,
  isReconciled: false,
});
const statement = (id: string, amount: number, journalIds: string[]) => ({
  id,
  amount,
  date: '2026-11-01T00:00:00.000Z',
  description: `Baris ${id}`,
  isReconciled: false,
  recommendations: journalIds.map((jid) => ({
    journalDetail: journal(jid, Math.max(amount, 0), Math.max(-amount, 0)),
    fuzzyScore: 4,
    dayDifference: 0,
  })),
});

const renderTable = () =>
  render(
    <MemoryRouter initialEntries={['/ledger/acc-1']}>
      <Routes>
        <Route path="/ledger/:idAccount" element={<ReconciliationTable />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  matchSelected.mockReset();
  state.isLoading = false;
  state.isError = false;
  state.imported = 5;
  state.recon = {
    bankStatements: [
      statement('s1', 1000000, ['j1']),
      statement('s2', 1000000, ['j1']),
      statement('s3', -250000, ['j3']),
      statement('s4', 123456, []),
    ],
    unreconciledJournalDetails: [journal('j9', 75000)],
  };
});

describe('ReconciliationTable', () => {
  it('shows what is open on both sides and the difference between them', () => {
    renderTable();
    expect(screen.getByText('Rekening koran belum dicocokkan')).toBeInTheDocument();
    expect(screen.getByText('Jurnal belum dicocokkan')).toBeInTheDocument();
    expect(screen.getByText('Selisih kedua sisi')).toBeInTheDocument();
    // 1.000.000 + 1.000.000 - 250.000 + 123.456 = 1.873.456 on the statement side
    expect(screen.getByText('Rp 1.873.456,00'.replace(' ', ' '))).toBeInTheDocument();
  });

  it('lists the journal lines that have no statement row', () => {
    renderTable();
    expect(screen.getByText('1 jurnal belum ada di rekening koran')).toBeInTheDocument();
    expect(screen.getByText('Jurnal j9')).toBeInTheDocument();
  });

  it('blocks a second row that suggests a journal line a ticked row already holds', async () => {
    renderTable();
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: 'Pilih baris Baris s1' }));
    expect(screen.getByRole('checkbox', { name: 'Pilih baris Baris s2' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Pilih baris Baris s3' })).toBeEnabled();
    expect(screen.getAllByText(/Jurnal ini juga disarankan untuk baris lain/)).toHaveLength(2);
  });

  it('cannot tick a row that has no suggestion yet', () => {
    renderTable();
    expect(screen.getByRole('checkbox', { name: 'Pilih baris Baris s4' })).toBeDisabled();
  });

  it('sends only the ticked rows when reconciling', async () => {
    renderTable();
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: 'Pilih baris Baris s1' }));
    await user.click(screen.getByRole('checkbox', { name: 'Pilih baris Baris s3' }));
    await user.click(screen.getByRole('button', { name: 'Rekonsiliasi (2)' }));
    expect(matchSelected).toHaveBeenCalledWith({
      matches: [
        { bankStatementId: 's1', journalDetailIds: ['j1'] },
        { bankStatementId: 's3', journalDetailIds: ['j3'] },
      ],
    });
  });

  it('hides a suggestion on this screen and can bring it back', async () => {
    renderTable();
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Abaikan saran ini' })[2]);
    expect(
      await screen.findByRole('button', { name: /Tampilkan 1 saran yang diabaikan/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Pilih baris Baris s3' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Tampilkan 1 saran yang diabaikan/ }));
    expect(screen.getByRole('checkbox', { name: 'Pilih baris Baris s3' })).toBeEnabled();
  });

  it('says every row is matched, not "import a statement", when none is left', () => {
    state.recon = { bankStatements: [], unreconciledJournalDetails: [] };
    renderTable();
    expect(screen.getByText('Semua rekening koran sudah dicocokkan')).toBeInTheDocument();
    expect(screen.queryByText('Rekonsiliasi Belum Tersedia')).not.toBeInTheDocument();
  });

  it('asks to import only when nothing was imported at all', () => {
    state.recon = { bankStatements: [], unreconciledJournalDetails: [] };
    state.imported = 0;
    renderTable();
    expect(screen.getByText('Rekonsiliasi Belum Tersedia')).toBeInTheDocument();
  });

  it('shows an error state with a retry', () => {
    state.isError = true;
    renderTable();
    expect(screen.getByText('Data rekonsiliasi belum dapat dimuat')).toBeInTheDocument();
  });
});
