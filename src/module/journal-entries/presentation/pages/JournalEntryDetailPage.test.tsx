import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, userEvent, waitFor, within } from '@test-utils';
import type { JournalEntryDetail } from '../../domain/journalEntry';
import { JournalEntryDetailPage } from './JournalEntryDetailPage';

const state = { entry: null as JournalEntryDetail | null };
const voidMutate = vi.fn();

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../hooks/useJournalEntryDetail', () => ({
  useJournalEntryDetail: () => ({ journalEntry: state.entry, isLoading: false, isError: false }),
}));
vi.mock('../hooks/useVoidJournalEntry', () => ({
  useVoidJournalEntry: () => ({ mutate: voidMutate, isPending: false }),
}));

const entry = (overrides: Partial<JournalEntryDetail>): JournalEntryDetail => ({
  id: 'j1',
  transactionNumber: '31294',
  transactionDate: '2026-11-04T00:00:00.000Z',
  status: 'ACTIVE',
  canVoid: true,
  voidBlockedReason: null,
  notes: 'Setoran',
  tags: [],
  attachments: [],
  transactionDetail: [
    { id: 'l1', account: { id: 'a1', name: 'Kas' }, debit: 1000 },
    { id: 'l2', account: { id: 'a2', name: 'Modal' }, credit: 1000 },
  ],
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/detail/j1']}>
      <Routes>
        <Route path="/detail/:idTransaction" element={<JournalEntryDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  voidMutate.mockReset();
  state.entry = entry({});
});

describe('journal detail: an entry is voided, never edited', () => {
  it('has no edit and no delete button', () => {
    renderPage();
    expect(screen.queryByRole('button', { name: /ubah|edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /hapus transaksi/i })).not.toBeInTheDocument();
  });

  it('offers the void only when canVoid is true', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Batalkan Jurnal' })).toBeInTheDocument();
  });

  it('hides the void and shows the server reason when canVoid is false', () => {
    state.entry = entry({
      canVoid: false,
      voidBlockedReason: 'Jurnal ini dibuat oleh modul Kas Kecil.',
    });
    renderPage();
    expect(screen.queryByRole('button', { name: 'Batalkan Jurnal' })).not.toBeInTheDocument();
    expect(screen.getByText('Jurnal ini dibuat oleh modul Kas Kecil.')).toBeInTheDocument();
  });

  it('shows a cancelled entry as cancelled and links to its reversal', () => {
    state.entry = entry({ status: 'VOID', canVoid: false, reversedBy: 'j2' });
    renderPage();
    expect(screen.queryByRole('button', { name: 'Batalkan Jurnal' })).not.toBeInTheDocument();
    expect(screen.getAllByText('Dibatalkan').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Lihat jurnal pembalik' })).toBeInTheDocument();
  });

  it('asks before voiding and then sends the id and number', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Batalkan Jurnal' }));
    expect(
      await screen.findByText(/Apakah Anda yakin ingin membatalkan jurnal #31294/)
    ).toBeInTheDocument();
    expect(voidMutate).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Batalkan Jurnal' }));
    await waitFor(() => expect(voidMutate).toHaveBeenCalledTimes(1));
    expect(voidMutate.mock.calls[0][0]).toEqual({ id: 'j1', number: '31294' });
  });
});
