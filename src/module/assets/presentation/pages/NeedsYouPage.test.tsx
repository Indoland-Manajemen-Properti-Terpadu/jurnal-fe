import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@test-utils';
import { NeedsYouPage } from './NeedsYouPage';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:x');
  URL.revokeObjectURL = vi.fn();
});

const report = (id: string, patch: Record<string, unknown> = {}) => ({
  id,
  number: `BA/ASET/2026/11/000${id.slice(1)}`,
  asset: 'a1',
  type: 'damaged',
  status: 'PENDING_APPROVAL',
  incidentDate: '2026-11-10T00:00:00.000Z',
  snapshot: { code: 'AC/001', name: 'AC Split Gree 1 PK', bookValue: 3843750 },
  createdBy: { id: 'u2', name: 'Raga' },
  submittedAt: '2026-11-17T09:40:23.576Z',
  canDecide: true,
  ...patch,
});

const asset = (id: string, patch: Record<string, unknown>) => ({
  id,
  code: id.toUpperCase(),
  name: `Aset ${id}`,
  acquisitionDate: '2026-04-02T00:00:00.000Z',
  acquisitionCost: 1000,
  status: 'active',
  ...patch,
});

const page = (rows: unknown[]) => ({
  data: {
    data: { data: rows, pagination: { total: rows.length, page: 1, limit: 100, totalPages: 1 } },
  },
});

type Setup = {
  pendingReports?: unknown[];
  pendingAssets?: unknown[];
  activeAssets?: unknown[];
  /** What `/summary` says, when it differs from the one page the list shows. */
  pendingTotal?: number;
};

const mockApi = ({
  pendingReports = [],
  pendingAssets = [],
  activeAssets = [],
  pendingTotal,
}: Setup) => {
  http.get.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
    const params = config?.params ?? {};
    if (url === '/v1/users/me') return Promise.resolve({ data: { id: 'u1', name: 'Edi' } });
    if (url === '/v1/asset-reports') {
      return Promise.resolve(page(params.status === 'PENDING_APPROVAL' ? pendingReports : []));
    }
    if (url === '/v1/assets') {
      return Promise.resolve(page(params.status === 'pending' ? pendingAssets : activeAssets));
    }
    if (url === '/v1/assets/summary') {
      return Promise.resolve({
        data: {
          data: {
            ownedCount: 5,
            pending: { count: pendingTotal ?? pendingAssets.length, totalAcquisitionCost: 1000 },
          },
        },
      });
    }
    return Promise.reject(new Error(`unexpected ${url}`));
  });
};

const due = (months: number, amount: number) => ({
  depreciationDue: { months, amount, upTo: '2026-10' },
});

const renderPage = () => {
  const router = createMemoryRouter([{ path: '/assets/needs-you', element: <NeedsYouPage /> }], {
    initialEntries: ['/assets/needs-you'],
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  http.get.mockReset();
  http.post.mockReset();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-17T10:00:00+07:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('NeedsYouPage', { timeout: 20_000 }, () => {
  it('sums up what is waiting in the three tiles', async () => {
    mockApi({
      pendingReports: [report('r1'), report('r2')],
      pendingAssets: [asset('p1', { status: 'pending' })],
      activeAssets: [
        asset('ac1', due(7, 656250)),
        asset('gst2', due(2, 22500000)),
        asset('it2', due(0, 0)),
      ],
    });
    renderPage();
    const decisions = await screen.findByText('Berita acara perlu keputusan');
    await waitFor(() => expect(decisions.previousSibling).toHaveTextContent('2'));
    expect(screen.getByText('Aset baru perlu diaktifkan').previousSibling).toHaveTextContent('1');
    expect(screen.getByText('2 aset · Rp 23.156.250,00')).toBeInTheDocument();
    // Each card has one button to its group.
    expect(screen.getAllByRole('button', { name: 'Lihat' })).toHaveLength(3);
  });

  it('only shows groups that have something in them', async () => {
    mockApi({ pendingAssets: [asset('p1', { status: 'pending' })] });
    renderPage();
    expect(await screen.findByText('Aset baru yang perlu diaktifkan')).toBeInTheDocument();
    expect(screen.queryByText('Perlu keputusan Anda')).not.toBeInTheDocument();
    // The tile carries that wording too; with nothing behind there is no group card under it.
    expect(screen.getAllByText('Penyusutan belum dibukukan')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /Bukukan sampai/ })).not.toBeInTheDocument();
  });

  it('says all is done when nothing waits', async () => {
    mockApi({});
    renderPage();
    expect(await screen.findByText('Semua beres')).toBeInTheDocument();
  });

  it('lists only my own pending reports under "Diajukan oleh Anda"', async () => {
    mockApi({
      pendingReports: [
        report('r1', { createdBy: { id: 'u1', name: 'Edi' }, canDecide: false }),
        report('r2', { createdBy: { id: 'u2', name: 'Raga' }, canDecide: false }),
      ],
    });
    renderPage();
    expect(await screen.findByText('Diajukan oleh Anda')).toBeInTheDocument();
    expect(screen.getByText(/BA\/ASET\/2026\/11\/0001/)).toBeInTheDocument();
    expect(screen.queryByText(/BA\/ASET\/2026\/11\/0002/)).not.toBeInTheDocument();
  });

  it('books depreciation up to last month and lists what failed', async () => {
    mockApi({ activeAssets: [asset('ac1', due(7, 656250)), asset('gst2', due(2, 22500000))] });
    http.post.mockResolvedValue({
      data: {
        data: {
          upTo: '2026-10',
          months: 7,
          amount: 656250,
          plan: [{ code: 'AC1', months: 7, from: '2026-04', to: '2026-10', amount: 656250 }],
          skipped: [],
          failed: [{ code: 'GST2', reason: 'Periode Oktober 2026 dikunci' }],
        },
      },
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Bukukan sampai Oktober 2026' }));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Bukukan sekarang' }));
    await waitFor(() =>
      expect(http.post).toHaveBeenCalledWith('/v1/assets/depreciation/run', { upTo: '2026-10' })
    );
    expect(await screen.findByText('Periode Oktober 2026 dikunci')).toBeInTheDocument();
  });

  it('says the data could not be loaded instead of "all done" when a request fails', async () => {
    http.get.mockImplementation((url: string) =>
      url === '/v1/users/me'
        ? Promise.resolve({ data: { id: 'u1' } })
        : Promise.reject(new Error('network'))
    );
    renderPage();
    expect(
      await screen.findByText('Data belum bisa dimuat. Coba lagi sebentar.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Semua beres')).not.toBeInTheDocument();
  });

  it('counts only what was booked in the success message', async () => {
    mockApi({ activeAssets: [asset('ac1', due(7, 656250)), asset('gst2', due(2, 22500000))] });
    http.post.mockResolvedValue({
      data: {
        data: {
          upTo: '2026-10',
          months: 9,
          amount: 23156250,
          plan: [
            { code: 'AC1', months: 7, from: '2026-04', to: '2026-10', amount: 656250 },
            { code: 'GST2', months: 2, from: '2026-09', to: '2026-10', amount: 22500000 },
          ],
          skipped: [],
          failed: [{ code: 'GST2', reason: 'Periode Oktober 2026 dikunci' }],
        },
      },
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Bukukan sampai Oktober 2026' }));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Bukukan sekarang' })
    );
    expect(
      await screen.findByText('Rp 656.250,00 untuk 1 aset sudah masuk jurnal.')
    ).toBeInTheDocument();
  });

  it('counts the pending assets from the summary, not from the one page the list shows', async () => {
    mockApi({ pendingAssets: [asset('p1', { status: 'pending' })], pendingTotal: 120 });
    renderPage();
    const title = await screen.findByText('Aset baru perlu diaktifkan');
    await waitFor(() => expect(title.previousSibling).toHaveTextContent('120'));
  });
});
