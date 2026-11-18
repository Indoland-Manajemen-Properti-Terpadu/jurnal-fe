import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@test-utils';
import { within } from '@testing-library/react';
import { AssetDetailPage } from './AssetDetailPage';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const base = {
  id: 'a1',
  code: 'GST/001',
  name: 'Genset Mitsubishi',
  categoryName: 'Generator Set',
  acquisitionDate: '2026-09-12T00:00:00.000Z',
  acquisitionCost: 400000000,
  netBookValue: 400000000,
  source: 'proapps',
  tags: [{ id: 't1', name: 'Engineering' }],
};

const active = {
  ...base,
  source: 'jurnal',
  status: 'active',
  usefulLifeYears: 4,
  residualValue: 0,
  monthlyEstimate: 8333333.33,
  assetAccount: { id: 'acc1', accountNumber: '1-20003', name: 'Mesin' },
  creditAccount: { id: 'acc2', accountNumber: '1-10003', name: 'Bank Mandiri' },
  accumDeprAccount: { id: 'acc3', accountNumber: '1-20103', name: 'Akum. Peny. Mesin' },
  deprExpenseAccount: { id: 'acc4', accountNumber: '6-50001', name: 'Biaya Peny. Mesin' },
  schedule: [
    {
      year: 2026,
      months: 3,
      beginning: 400000000,
      expense: 25000000,
      accumulated: 25000000,
      ending: 375000000,
    },
  ],
};

const pendingReport = {
  id: 'r1',
  number: 'BA/ASET/2026/11/0001',
  asset: 'a1',
  type: 'damaged',
  status: 'PENDING_APPROVAL',
};

const mockApi = (
  asset: Record<string, unknown>,
  journals: unknown[] = [],
  reports: unknown[] = []
) => {
  http.get.mockImplementation((url: string) => {
    if (url === '/v1/asset-reports') {
      return Promise.resolve({
        data: {
          data: {
            data: reports,
            pagination: { total: reports.length, page: 1, limit: 1, totalPages: 1 },
          },
        },
      });
    }
    if (url.endsWith('/journals')) return Promise.resolve({ data: { data: journals } });
    if (url === '/v1/accounts') return Promise.resolve({ data: { results: [] } });
    if (url === '/v1/tags') return Promise.resolve({ data: { data: { data: [] } } });
    return Promise.resolve({ data: { data: asset } });
  });
};

function LocationProbe() {
  const location = useLocation();
  return <div>Lokasi: {location.pathname + location.search}</div>;
}

const renderPage = (path = '/assets/a1') =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/assets/write-offs/new" element={<LocationProbe />} />
          <Route path="/assets/write-offs/:id" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('<AssetDetailPage />', { timeout: 15_000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invites to activate a pending asset and offers no edit of ProApps master data', async () => {
    mockApi({ ...base, status: 'pending' });
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText('Aset belum diaktifkan')).toBeInTheDocument();
    // The details open first; the depreciation tab says the asset waits for activation.
    expect(screen.getByRole('tab', { name: 'Detail Aset' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await user.click(screen.getByRole('tab', { name: 'Penyusutan' }));
    expect(screen.getByText('Menunggu aktivasi')).toBeInTheDocument();
    // Back stays a button of its own; the other actions are in the menu.
    expect(screen.getByRole('button', { name: 'Kembali' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    // Tags of a ProApps asset stay editable, so the edit action is still offered.
    expect(
      await screen.findByRole('menuitem', { name: 'Ubah Data', hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Lepas Aset', hidden: true })
    ).not.toBeInTheDocument();
    // No journals are requested before the asset is in the books.
    expect(http.get).not.toHaveBeenCalledWith('/v1/assets/a1/journals');
  });

  it('opens the activation dialog and asks for the missing accounts', async () => {
    mockApi({ ...base, status: 'pending' });
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Aktifkan Aset' }));
    expect(await screen.findByText('Jurnal perolehan yang akan dibukukan')).toBeInTheDocument();

    const dialog = within(screen.getByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Aktifkan Aset' }));
    expect((await dialog.findAllByText('Pilih akun')).length).toBeGreaterThanOrEqual(4);
    expect(http.post).not.toHaveBeenCalled();
  });

  it('shows the schedule, the accounts and the journals of an active asset', async () => {
    mockApi(active, [
      {
        id: 'j1',
        transactionNumber: 12215,
        transactionDate: '2026-10-15T00:00:00.000Z',
        status: 'ACTIVE',
        notes: 'Perolehan Aset GST/001',
        transactionDetail: [],
      },
    ]);
    const user = userEvent.setup();
    renderPage();
    // The details open first, with the ledger accounts in the side column.
    expect(await screen.findByText('1-20003 · Mesin')).toBeInTheDocument();
    // The depreciation tab holds the schedule, the journals tab the posted journals.
    await user.click(screen.getByRole('tab', { name: 'Penyusutan' }));
    expect(await screen.findByText('2026')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Jurnal/ }));
    expect(await screen.findByText('Perolehan Aset GST/001')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    const menu = within(await screen.findByRole('menu', { hidden: true }));
    expect(menu.getByRole('menuitem', { name: 'Lepas Aset', hidden: true })).toBeInTheDocument();
    expect(
      menu.getByRole('menuitem', { name: 'Ubah Penyusutan', hidden: true })
    ).toBeInTheDocument();
    expect(screen.queryByText('Aset belum diaktifkan')).not.toBeInTheDocument();
  });

  it('opens the tab named in the address', async () => {
    mockApi(active);
    renderPage('/assets/a1?tab=depreciation');
    expect(await screen.findByRole('tab', { name: 'Penyusutan' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(await screen.findByText('Apa itu penyusutan?')).toBeInTheDocument();
  });

  it('opens the report form when an active asset is disposed', async () => {
    mockApi(active);
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Aksi Lainnya' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Lepas Aset', hidden: true }));
    expect(await screen.findByText('Lokasi: /assets/write-offs/new?asset=a1')).toBeInTheDocument();
  });

  it('points to the pending report instead of offering a second one', async () => {
    mockApi(active, [], [pendingReport]);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText(/BA\/ASET\/2026\/11\/0001/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    expect(
      screen.queryByRole('menuitem', { name: 'Lepas Aset', hidden: true })
    ).not.toBeInTheDocument();
    await user.click(
      await screen.findByRole('menuitem', { name: 'Buka berita acara', hidden: true })
    );
    expect(await screen.findByText('Lokasi: /assets/write-offs/r1')).toBeInTheDocument();
  });

  it('links a disposed asset to the report that disposed it', async () => {
    mockApi({ ...active, status: 'disposed', disposalType: 'scrapped', disposalReport: 'r7' });
    renderPage();
    expect(await screen.findByRole('link', { name: /Berita acara/ })).toHaveAttribute(
      'href',
      '/assets/write-offs/r7'
    );
  });
});
