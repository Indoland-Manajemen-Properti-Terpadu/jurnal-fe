import { act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import { AssetPage } from './AssetPage';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const asset = {
  id: 'a1',
  code: 'GST/001/DEMO-SITE/2026',
  name: 'Genset Mitsubishi',
  categoryName: 'Generator Set',
  acquisitionDate: '2026-09-12T00:00:00.000Z',
  acquisitionCost: 400000000,
  netBookValue: 400000000,
  status: 'pending',
  source: 'proapps',
};

const mockApi = (
  items: unknown[],
  counts = { pending: items.length, active: 0, fully_depreciated: 0, disposed: 0 }
) => {
  http.get.mockImplementation((url: string) =>
    Promise.resolve({
      data:
        url === '/v1/assets/summary'
          ? {
              data: {
                totalAcquisitionCost: 400000000,
                totalAccumulatedDepreciation: 0,
                totalNetBookValue: 400000000,
                counts,
                ownedCount: counts.active + counts.fully_depreciated,
                pending: { count: counts.pending, totalAcquisitionCost: 0 },
              },
            }
          : {
              data: {
                data: items,
                pagination: { total: items.length, page: 1, limit: 10, totalPages: 1 },
              },
            },
    })
  );
};

const renderPage = (path = '/assets') =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[path]}>
        <AssetPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

function CurrentPath() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

describe('<AssetPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  it('renders the Indonesian title, the totals and the assets from the API', async () => {
    mockApi([asset]);
    renderPage();
    expect(screen.getByText('Aset Tetap (Fixed Assets)')).toBeInTheDocument();
    expect(await screen.findByText('Genset Mitsubishi')).toBeInTheDocument();
    expect(screen.getByText('Total Nilai Perolehan')).toBeInTheDocument();
    // Pending assets live in "Menunggu Anda", not in this list.
    expect(screen.queryByRole('tab', { name: /Menunggu Aktivasi/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Semua/ })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Aktif/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('asks the API for the first page, newest first', async () => {
    mockApi([asset]);
    renderPage();
    await screen.findByText('Genset Mitsubishi');
    expect(http.get).toHaveBeenCalledWith('/v1/assets', {
      params: {
        page: 1,
        limit: 10,
        status: 'active',
        search: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });
  });

  it('shows the empty state when there are no assets', async () => {
    mockApi([]);
    renderPage();
    expect(await screen.findByText('Belum Ada Aset Tetap Terdaftar')).toBeInTheDocument();
  });

  it('renders the English title and labels', async () => {
    act(() => useI18nStore.getState().setLanguage('en'));
    mockApi([asset]);
    renderPage();
    expect(screen.getByText('Fixed Assets')).toBeInTheDocument();
    expect(await screen.findByText('Genset Mitsubishi')).toBeInTheDocument();
    expect(screen.getByText('Total Acquisition Cost')).toBeInTheDocument();
  });

  it('opens the asset when any part of its row is clicked, not only the name', async () => {
    mockApi([asset]);
    const user = userEvent.setup();
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <MemoryRouter initialEntries={['/assets']}>
          <CurrentPath />
          <Routes>
            <Route path="/assets" element={<AssetPage />} />
            <Route path="/assets/:id" element={<span>detail</span>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    await user.click(await screen.findByText('Generator Set'));
    expect(screen.getByTestId('path')).toHaveTextContent('/assets/a1');
  });

  it('falls back to the active tab for an old link to the pending tab', async () => {
    mockApi([]);
    renderPage('/assets?status=pending');
    await screen.findByText('Belum Ada Aset Tetap Terdaftar');
    expect(http.get).toHaveBeenCalledWith(
      '/v1/assets',
      expect.objectContaining({ params: expect.objectContaining({ status: 'active' }) })
    );
  });

  it('names how each disposed asset left and links its report', async () => {
    const disposed = (id: string, patch: Record<string, unknown>) => ({
      ...asset,
      id,
      code: id.toUpperCase(),
      name: `Aset ${id}`,
      status: 'disposed',
      ...patch,
    });
    mockApi(
      [
        disposed('d1', { disposalType: null, disposalPrice: 9000000 }),
        disposed('d2', { disposalType: null, disposalPrice: 0 }),
        disposed('d3', { disposalType: 'scrapped', disposalPrice: 0, disposalReport: 'r7' }),
      ],
      { pending: 0, active: 0, fully_depreciated: 0, disposed: 3 }
    );
    renderPage('/assets?status=disposed');
    expect(await screen.findByText('Aset d1')).toBeInTheDocument();
    expect(screen.getByText('Hasil pelepasan')).toBeInTheDocument();
    expect(screen.getByText('Dijual')).toBeInTheDocument();
    expect(screen.getByText('Dilepas')).toBeInTheDocument();
    expect(screen.getByText('Dimusnahkan')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Berita acara' })).toHaveAttribute(
      'href',
      '/assets/write-offs/r7'
    );
  });
});
