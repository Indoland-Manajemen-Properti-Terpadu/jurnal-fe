import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/lib/http/apiClient';
import { useStockRights } from './useStockQueries';
import { useTransferMutations } from './useTransferMutations';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const setup = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { wrapper, invalidate };
};

describe('useStockRights', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('offers nothing until the rights are known, then follows each menu', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        role: 'user',
        permissions: [
          { menuId: 'JP-STOCK-CARD', create: false, read: true, update: false, delete: false },
          { menuId: 'JP-STOCK-TRF', create: true, read: true, update: false, delete: true },
        ],
      },
    } as never);
    const { wrapper } = setup();

    const { result } = renderHook(() => useStockRights(), { wrapper });
    expect(result.current.card.read).toBe(false);
    expect(result.current.transfer.create).toBe(false);

    await waitFor(() => expect(result.current.card.read).toBe(true));
    expect(result.current.transfer).toEqual({
      create: true,
      read: true,
      update: false,
      delete: true,
    });
    expect(result.current.card.create).toBe(false);
  });
});

describe('useTransferMutations', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  const transferDto = {
    id: 't1',
    transactionNumber: 'PDH/2026/11/0001',
    transactionDate: '2026-11-22T00:00:00.000Z',
    from: { id: 'a', code: 'GDG-001', name: 'Utama' },
    to: { id: 'b', code: 'GDG-002', name: 'Cadangan' },
    items: [],
    status: 'POSTED',
  };

  it('refreshes every inventory figure after a transfer is saved', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data: transferDto } } as never);
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useTransferMutations(), { wrapper });

    act(() =>
      result.current.create.mutate({
        date: '2026-11-22',
        fromWarehouse: 'a',
        toWarehouse: 'b',
        memo: '',
        lines: [{ product: 'p1', quantity: 1 }],
      })
    );

    await waitFor(() => expect(invalidate).toHaveBeenCalled());
    expect(apiClient.post).toHaveBeenCalledWith('/v1/stock/transfers', {
      transactionDate: '2026-11-22',
      fromWarehouse: 'a',
      toWarehouse: 'b',
      items: [{ product: 'p1', quantity: 1 }],
    });
  });

  it('sends the reason when a transfer is cancelled', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { data: { ...transferDto, status: 'VOID' } },
    } as never);
    const { wrapper } = setup();
    const { result } = renderHook(() => useTransferMutations(), { wrapper });

    act(() => result.current.cancel.mutate({ id: 't1', reason: ' Salah gudang ' }));

    await waitFor(() =>
      expect(apiClient.post).toHaveBeenCalledWith('/v1/stock/transfers/t1/void', {
        reason: 'Salah gudang',
      })
    );
  });
});
