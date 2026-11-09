import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

const mockApi = (asset: Record<string, unknown>, journals: unknown[] = []) => {
  http.get.mockImplementation((url: string) => {
    if (url.endsWith('/journals')) return Promise.resolve({ data: { data: journals } });
    if (url === '/v1/accounts') return Promise.resolve({ data: { results: [] } });
    if (url === '/v1/tags') return Promise.resolve({ data: { data: { data: [] } } });
    return Promise.resolve({ data: { data: asset } });
  });
};

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('<AssetDetailPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invites to activate a pending asset and offers no edit of ProApps master data', async () => {
    mockApi({ ...base, status: 'pending' });
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText('Aset belum diaktifkan')).toBeInTheDocument();
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
    expect(await screen.findByText('Mesin')).toBeInTheDocument();
    expect(screen.getByText('1-20003')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(await screen.findByText('Perolehan Aset GST/001')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    const menu = within(await screen.findByRole('menu', { hidden: true }));
    expect(menu.getByRole('menuitem', { name: 'Lepas Aset', hidden: true })).toBeInTheDocument();
    expect(
      menu.getByRole('menuitem', { name: 'Ubah Penyusutan', hidden: true })
    ).toBeInTheDocument();
    expect(screen.queryByText('Aset belum diaktifkan')).not.toBeInTheDocument();
  });
});
