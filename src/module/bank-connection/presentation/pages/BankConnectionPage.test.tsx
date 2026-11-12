import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BankConnectionPage from '@/module/bank-connection/presentation/pages/BankConnectionPage';

const q = vi.hoisted(() => ({
  providers: {} as Record<string, unknown>,
  connections: {} as Record<string, unknown>,
}));

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/module/chart-of-accounts', () => ({
  useSimpleAccounts: () => ({
    accounts: [{ id: 'acc-1', name: 'Rekening Operasional', accountNumber: '1-10003' }],
  }),
}));
vi.mock('@/module/bank-connection/presentation/hooks/useBankConnectionMutations', () => ({
  useProposeBank: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/module/bank-connection/presentation/hooks/useBankConnectionQueries', () => ({
  useBankProviders: () => q.providers,
  useAccountConnections: () => q.connections,
}));

const provider = (over: object = {}) => ({
  id: 'p1',
  bankName: 'Bank Contoh A',
  accountTypes: ['CORPORATE'],
  capabilities: ['FEED'],
  status: 'AVAILABLE',
  requiredFields: [],
  monthlyFee: 50000,
  ...over,
});

const renderPage = (url = '/bank-cash/connection?accountId=acc-1') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/bank-cash/connection" element={<BankConnectionPage />} />
        <Route path="/bank-cash/connection/new" element={<div>halaman formulir</div>} />
        <Route path="/bank-cash/connection/:connectionId" element={<div>halaman detail</div>} />
        <Route path="/bank-cash" element={<div>daftar kas</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('BankConnectionPage', () => {
  beforeEach(() => {
    q.providers = { data: [provider()], isLoading: false, error: null };
    q.connections = { data: [] };
  });

  it('lists the banks the backend offers, with their account types and fee', () => {
    renderPage();
    expect(screen.getByText('Bank Contoh A')).toBeTruthy();
    expect(screen.getByText('Korporasi')).toBeTruthy();
    expect(screen.getByText(/Biaya .*50\.000.* per bulan/)).toBeTruthy();
    expect(screen.getByText(/1-10003 · Rekening Operasional/)).toBeTruthy();
  });

  it('opens the form with the chosen bank and account', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Hubungkan' }));
    expect(await screen.findByText('halaman formulir')).toBeTruthy();
  });

  it('does not let a bank that is not available be chosen', () => {
    q.providers = { data: [provider({ status: 'COMING_SOON' })], isLoading: false, error: null };
    renderPage();
    expect(screen.getByRole('button', { name: 'Hubungkan' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getAllByText('Segera hadir').length).toBeGreaterThan(0);
  });

  it('while the backend has no list, offers the banks that have a logo as ordinary banks to choose', async () => {
    q.providers = { data: undefined, isLoading: false, error: { kind: 'unavailable' } };
    renderPage();
    ['BCA', 'Mandiri', 'BNI', 'CIMB Niaga'].forEach((name) => {
      expect(screen.getByRole('img', { name })).toBeTruthy();
    });
    expect(screen.queryByRole('img', { name: 'BRI' })).toBeNull();
    expect(screen.queryByText(/Segera hadir|segera hadir|direncanakan/)).toBeNull();
    const buttons = screen.getAllByRole('button', { name: 'Hubungkan' });
    expect(buttons.every((button) => !button.hasAttribute('disabled'))).toBe(true);
    await userEvent.click(buttons[0]);
    expect(await screen.findByText('halaman formulir')).toBeTruthy();
  });

  it('shows only the banks of the backend once it has a list', () => {
    renderPage();
    expect(screen.getByText('Bank Contoh A')).toBeTruthy();
    expect(screen.queryByRole('img', { name: 'Mandiri' })).toBeNull();
  });

  it('shows the four steps after the banks, in order, as one connected process', () => {
    renderPage();
    const banks = screen.getByRole('button', { name: 'Hubungkan' });
    const steps = ['Isi formulir', 'Ditinjau', 'Tanda tangan dan kirim', 'Aktif'].map((label) =>
      screen.getByText(label)
    );
    steps.forEach((step) => {
      expect(banks.compareDocumentPosition(step) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
    steps.slice(1).forEach((step, index) => {
      expect(
        steps[index].compareDocumentPosition(step) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
    expect(screen.getByText('Data rekening dan penanggung jawab.')).toBeTruthy();
  });

  it('offers to propose a bank that is not listed', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '+ Usulkan bank lain' }));
    expect(await screen.findByText('Bank apa yang Anda butuhkan?')).toBeTruthy();
  });

  it('shows a retryable error for a failed load, and a permission message when forbidden', () => {
    q.providers = {
      data: undefined,
      isLoading: false,
      error: { kind: 'network' },
      refetch: vi.fn(),
    };
    const { unmount } = renderPage();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeTruthy();
    unmount();
    q.providers = { data: undefined, isLoading: false, error: { kind: 'forbidden' } };
    renderPage();
    expect(screen.getByText(/belum memiliki izin/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Coba lagi' })).toBeNull();
  });

  it('sends the user to the connection the account already has', () => {
    q.connections = { data: [{ id: 'bc_9', status: 'IN_REVIEW' }] };
    renderPage();
    expect(screen.getByText('halaman detail')).toBeTruthy();
  });

  it('lets an account with only an expired or finished connection start a new one', () => {
    q.connections = {
      data: [
        { id: 'bc_8', status: 'EXPIRED' },
        { id: 'bc_7', status: 'REVOKED' },
      ],
    };
    renderPage();
    expect(screen.getByText('Bank Contoh A')).toBeTruthy();
  });

  it('says when there is no bank at all', () => {
    q.providers = { data: [], isLoading: false, error: null };
    renderPage();
    expect(screen.getByText('Belum ada bank yang tersedia')).toBeTruthy();
  });
});
