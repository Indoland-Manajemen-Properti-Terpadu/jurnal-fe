import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@test-utils';
import { NeedsYouCard } from './NeedsYouCard';

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const page = (rows: unknown[]) => ({
  data: {
    data: { data: rows, pagination: { total: rows.length, page: 1, limit: 100, totalPages: 1 } },
  },
});

const report = (id: string, patch: Record<string, unknown> = {}) => ({
  id,
  number: `BA/ASET/2026/11/000${id.slice(1)}`,
  asset: 'a1',
  type: 'damaged',
  status: 'PENDING_APPROVAL',
  snapshot: { code: 'AC/001', name: 'AC Split Gree 1 PK' },
  createdBy: { id: 'u2', name: 'Raga' },
  submittedAt: '2026-11-17T09:52:00+07:00',
  canDecide: true,
  ...patch,
});

const mockApi = (reports: unknown[], pending: unknown[] = [], active: unknown[] = []) =>
  http.get.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
    if (url === '/v1/users/me') return Promise.resolve({ data: { id: 'u1' } });
    if (url === '/v1/asset-reports') return Promise.resolve(page(reports));
    if (url === '/v1/assets') {
      return Promise.resolve(page(config?.params?.status === 'pending' ? pending : active));
    }
    return Promise.reject(new Error(url));
  });

const renderCard = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <NeedsYouCard />
      </MemoryRouter>
    </QueryClientProvider>
  );

beforeEach(() => {
  http.get.mockReset();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-17T10:00:00+07:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('NeedsYouCard', () => {
  it('leads with the report to decide and links every row to where it is handled', async () => {
    mockApi(
      [report('r1'), report('r2', { createdBy: { id: 'u1', name: 'Edi' }, canDecide: false })],
      [
        {
          id: 'p1',
          code: 'P1',
          name: 'Mesin Fotokopi',
          acquisitionDate: '2026-11-01',
          status: 'pending',
        },
      ],
      [
        {
          id: 'a2',
          code: 'GST/002',
          name: 'Genset',
          acquisitionDate: '2026-09-12',
          status: 'active',
          depreciationDue: { months: 2, amount: 22500000, upTo: '2026-10' },
        },
      ]
    );
    renderCard();
    const decision = await screen.findByRole('link', {
      name: /BA\/ASET\/2026\/11\/0001.*Rusak menunggu keputusan Anda/,
    });
    expect(decision).toHaveAttribute('href', '/assets/write-offs/r1');
    expect(decision).toHaveTextContent('AC Split Gree 1 PK');
    expect(decision).toHaveTextContent('8 mnt');
    expect(screen.getByRole('link', { name: /1 aset baru perlu diaktifkan/ })).toHaveAttribute(
      'href',
      '/assets/needs-you#needs-you-pending'
    );
    expect(screen.getByRole('link', { name: /Penyusutan 1 aset belum dibukukan/ })).toHaveAttribute(
      'href',
      '/assets/needs-you#needs-you-depreciation'
    );
    // The user's own report says whom it waits on.
    expect(screen.getByRole('link', { name: /BA\/ASET\/2026\/11\/0002/ })).toHaveTextContent(
      'Menunggu Penyetuju'
    );
    const openAll = screen.getByRole('link', { name: /Buka semua/ });
    expect(openAll).toHaveAttribute('href', '/assets/needs-you');
    // No count badge beside the title; the line under it says how many in words.
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    expect(screen.getByText('Ada 4 hal yang perlu tindakan Anda')).toBeInTheDocument();
  });

  it('stays calm when nothing waits', async () => {
    mockApi([]);
    renderCard();
    expect(await screen.findByText('Semua beres')).toBeInTheDocument();
  });

  it('does not claim all is done when the data failed to load', async () => {
    http.get.mockRejectedValue(new Error('network'));
    renderCard();
    expect(
      await screen.findByText('Data belum bisa dimuat. Coba lagi sebentar.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Semua beres')).not.toBeInTheDocument();
  });
});
