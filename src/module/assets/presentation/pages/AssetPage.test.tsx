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

const mockApi = (items: unknown[]) => {
  http.get.mockImplementation((url: string) =>
    Promise.resolve({
      data:
        url === '/v1/assets/summary'
          ? {
              data: {
                totalAcquisitionCost: 400000000,
                totalAccumulatedDepreciation: 0,
                totalNetBookValue: 400000000,
                counts: { pending: items.length, active: 0, fully_depreciated: 0, disposed: 0 },
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

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
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
    expect(screen.getByRole('tab', { name: /Menunggu Aktivasi \(1\)/ })).toBeInTheDocument();
    expect(screen.getByText('1 aset menunggu aktivasi')).toBeInTheDocument();
  });

  it('asks the API for the first page, newest first', async () => {
    mockApi([asset]);
    renderPage();
    await screen.findByText('Genset Mitsubishi');
    expect(http.get).toHaveBeenCalledWith('/v1/assets', {
      params: {
        page: 1,
        limit: 10,
        status: undefined,
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
});
