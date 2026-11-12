import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@test-utils';
import { PeriodListPage } from './PeriodListPage';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const period = (overrides: Record<string, unknown>) => ({
  id: 'p',
  name: 'Periode',
  type: 'LOCK',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-01-31T00:00:00.000Z',
  isActive: true,
  notes: '',
  createdBy: { id: 'u1', name: 'Rina' },
  closingJournalId: null,
  createdAt: '2026-02-01T03:00:00.000Z',
  ...overrides,
});

const close2025 = period({
  id: 'c2025',
  name: 'Tutup Buku 2025',
  type: 'CLOSE',
  startDate: '2025-01-01T00:00:00.000Z',
  endDate: '2025-12-31T00:00:00.000Z',
  closingJournalId: 'j2025',
});
const close2024 = period({
  id: 'c2024',
  name: 'Tutup Buku 2024',
  type: 'CLOSE',
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-12-31T00:00:00.000Z',
  closingJournalId: 'j2024',
});
const lockJan = period({ id: 'l1', name: 'Kunci Januari 2026' });

const ALL_RIGHTS = { menuId: 'JP-GL-PC', create: true, read: true, update: true, delete: true };

const page = (results: unknown[]) => ({
  data: {
    data: { results, page: 1, limit: 10, totalPages: 1, totalResults: results.length },
  },
});

const mockApi = (rights: Record<string, unknown> | null) => {
  http.get.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
    if (url === '/v1/users/me/permissions') {
      return Promise.resolve({ data: { role: 'user', permissions: rights ? [rights] : [] } });
    }
    const params = config?.params ?? {};
    if (params.type === 'CLOSE') return Promise.resolve(page([close2025, close2024]));
    if (params.type === 'LOCK') return Promise.resolve(page([lockJan]));
    return Promise.resolve(page([lockJan, close2025, close2024]));
  });
};

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <PeriodListPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

const rowOf = async (name: string) => (await screen.findByText(name)).closest('tr') as HTMLElement;

describe('<PeriodListPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows where the books stand and every period', async () => {
    mockApi(ALL_RIGHTS);
    renderPage();

    expect(await screen.findByText('31 Des 2025')).toBeInTheDocument();
    expect(screen.getByText('1 periode')).toBeInTheDocument();
    expect(screen.getByText('1 Jan 2026')).toBeInTheDocument();
    const latest = await rowOf('Tutup Buku 2025');
    expect(within(latest).getByText('Terakhir')).toBeInTheDocument();
    expect(within(await rowOf('Kunci Januari 2026')).getByText('31 hari')).toBeInTheDocument();
  });

  /** Opens a row's menu and returns its items by their visible text. */
  const openMenu = async (rowName: string) => {
    mockApi(ALL_RIGHTS);
    const user = userEvent.setup();
    renderPage();
    await user.click(within(await rowOf(rowName)).getByRole('button'));
    const items = await screen.findAllByRole('menuitem');
    return (label: string) => items.find((item) => item.textContent?.startsWith(label));
  };

  it('lets a lock be deleted', async () => {
    const item = await openMenu('Kunci Januari 2026');
    expect(item('Hapus')).toBeDefined();
    expect(item('Buka kembali')).toBeUndefined();
  });

  it('never deletes a closing and reopens the latest one', async () => {
    const item = await openMenu('Tutup Buku 2025');
    expect(item('Hapus')).toBeUndefined();
    expect(item('Buka kembali')).toBeEnabled();
  });

  it('keeps reopen disabled on an older closing and says why', async () => {
    const item = await openMenu('Tutup Buku 2024');
    expect(item('Buka kembali')).toBeDisabled();
    expect(item('Buka kembali')).toHaveTextContent(/Hanya tutup buku terakhir/);
  });

  it('reopens the latest closing only after the user acknowledges what it changes', async () => {
    mockApi(ALL_RIGHTS);
    http.post.mockResolvedValue({ data: { data: { ...close2025, isActive: false } } });
    const user = userEvent.setup();
    renderPage();

    await user.click(within(await rowOf('Tutup Buku 2025')).getByRole('button'));
    await user.click(await screen.findByRole('menuitem', { name: 'Buka kembali' }));

    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Buka kembali' });
    expect(within(dialog).getByText(/Jurnal penutup dibatalkan/)).toBeInTheDocument();
    expect(confirm).toBeDisabled();

    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(confirm);

    await waitFor(() =>
      expect(http.post).toHaveBeenCalledWith('/v1/accounting-periods/c2025/reopen')
    );
  });

  it('hides every change for someone who may only read', async () => {
    mockApi({ ...ALL_RIGHTS, create: false, update: false, delete: false });
    renderPage();

    await rowOf('Tutup Buku 2025');
    expect(screen.queryByRole('button', { name: 'Tutup Buku' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aksi untuk Kunci/ })).not.toBeInTheDocument();
    // A closing with a journal still lets the reader open that journal.
    expect(screen.getByRole('button', { name: /Aksi untuk Tutup Buku 2025/ })).toBeInTheDocument();
  });

  it('explains the missing access instead of showing an empty list', async () => {
    mockApi(null);
    renderPage();

    expect(await screen.findByText('Anda belum memiliki akses')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
