import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@test-utils';
import { CloseBooksPage } from './CloseBooksPage';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const close2024 = {
  id: 'c2024',
  name: 'Tutup Buku 2024',
  type: 'CLOSE',
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-12-31T00:00:00.000Z',
  isActive: true,
};

const tbAccount = (
  id: string,
  number: string,
  name: string,
  categoryID: string,
  closing: { debit: number | null; credit: number | null },
  profitLoss: { debit: number | null; credit: number | null } | null
) => ({
  account: { id, accountNumber: number, name, category: { categoryID, name: categoryID } },
  opening: null,
  movement: null,
  closing,
  profitLoss,
  balanceSheet: profitLoss ? null : closing,
});

const trialBalance = {
  data: {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    accounts: [
      tbAccount('bank', '1-10003', 'Bank Mandiri', 'KB', { debit: 700, credit: null }, null),
      tbAccount(
        'sales',
        '4-10001',
        'Pendapatan Jasa',
        'PD',
        { debit: null, credit: 1000 },
        {
          debit: null,
          credit: 1000,
        }
      ),
      tbAccount(
        'rent',
        '6-10001',
        'Beban Sewa',
        'BB',
        { debit: 300, credit: null },
        {
          debit: 300,
          credit: null,
        }
      ),
    ],
    totals: {
      opening: { debit: 0, credit: 0 },
      movement: { debit: 1000, credit: 1000 },
      closing: { debit: 1000, credit: 1000 },
      profitLoss: { debit: 300, credit: 1000 },
      balanceSheet: { debit: 700, credit: 0 },
    },
    balancing: { profitLoss: { debit: 700, credit: 0 }, balanceSheet: { debit: 0, credit: 700 } },
    profit: 700,
    pagination: { page: 1, limit: 100, totalRows: 3, totalPages: 1 },
  },
};

const mockApi = () => {
  http.get.mockImplementation((url: string) => {
    if (url === '/v1/users/me/permissions') {
      return Promise.resolve({ data: { role: 'superadmin' } });
    }
    if (url === '/v1/settings/account-mappings') {
      return Promise.resolve({
        data: {
          data: {
            other: [
              {
                id: 'm1',
                key: 'retained_earnings',
                label: 'Laba Ditahan',
                group: 'other',
                account: { id: 're', name: 'Laba Ditahan', accountNumber: '3-10002' },
              },
            ],
          },
        },
      });
    }
    if (url === '/v1/reports/trial-balance') return Promise.resolve({ data: trialBalance });
    return Promise.resolve({
      data: { data: { results: [close2024], page: 1, limit: 100, totalPages: 1, totalResults: 1 } },
    });
  });
};

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <CloseBooksPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('<CloseBooksPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-12T10:00:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('walks from the period to the closing, and closes only after every confirmation', async () => {
    mockApi();
    http.post.mockResolvedValue({
      data: {
        data: {
          ...close2024,
          id: 'c2025',
          name: 'Tutup Buku 2025',
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-12-31T00:00:00.000Z',
          closingJournalId: 'j1',
        },
      },
    });
    const user = userEvent.setup();
    renderPage();

    // Step 1: continues the day after the latest closing, named after the year.
    expect(await screen.findByDisplayValue('Tutup Buku 2025')).toBeInTheDocument();
    expect(
      screen.getByText(/transaksi sampai 31 Des 2025 tidak bisa ditambah/)
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Lanjutkan/ }));

    // Step 2: automatic checks pass; the manual ones must all be ticked.
    expect(await screen.findByText(/Laba atau rugi akan dipindah ke 3-10002/)).toBeInTheDocument();
    expect(await screen.findByText(/Total debit dan kredit sama/)).toBeInTheDocument();
    const next = screen.getByRole('button', { name: /Lanjutkan/ });
    expect(next).toBeDisabled();
    for (const box of screen.getAllByRole('checkbox')) await user.click(box);
    expect(next).toBeEnabled();
    await user.click(next);

    // Step 3: the worksheet lists accounts with a balance and the net profit.
    expect(await screen.findByText('Beban Sewa')).toBeInTheDocument();
    expect(screen.getByText('Laba bersih')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Lanjutkan/ }));

    // Step 4: the closing journal moves the profit to retained earnings.
    expect(await screen.findByText('Laba bersih ke Laba Ditahan')).toBeInTheDocument();
    expect(screen.getByText('3-10002 Laba Ditahan')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: /Tutup Buku Sekarang/ });
    expect(submit).toBeDisabled();
    await user.click(screen.getByRole('checkbox'));
    await user.click(submit);

    await waitFor(() =>
      expect(http.post).toHaveBeenCalledWith('/v1/accounting-periods', {
        name: 'Tutup Buku 2025',
        type: 'CLOSE',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        notes: undefined,
      })
    );
    expect(await screen.findByText('Buku sudah ditutup sampai 31 Des 2025')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lihat jurnal penutup/ })).toBeInTheDocument();
  });
});
