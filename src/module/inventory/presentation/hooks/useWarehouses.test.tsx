import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/lib/http/apiClient';
import { useWarehouseList, useWarehouseMutations, useWarehouseRights } from './useWarehouses';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const listBody = (names: string[]) => ({
  data: {
    data: {
      results: names.map((name, index) => ({
        id: `w${index}`,
        code: `GDG-00${index}`,
        name,
        isActive: true,
      })),
      page: 1,
      totalPages: 1,
      totalResults: names.length,
      summary: { totalCount: names.length, activeCount: names.length, itemCount: 0 },
    },
  },
});

const setup = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe('useWarehouseRights', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('offers nothing until the rights are known, then follows the Stock & Warehouse menu', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        role: 'user',
        permissions: [
          { menuId: 'JP-STOCK', create: true, read: true, update: true, delete: false },
          { menuId: 'JP-STOCK-OPN', create: true, read: true, update: true, delete: true },
        ],
      },
    } as never);
    const { wrapper } = setup();

    const { result } = renderHook(() => useWarehouseRights(), { wrapper });
    expect(result.current).toEqual({ create: false, read: false, update: false, delete: false });

    await waitFor(() => expect(result.current.create).toBe(true));
    expect(result.current).toEqual({ create: true, read: true, update: true, delete: false });
  });

  it('gives a superadmin every right', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { role: 'superadmin' } } as never);
    const { wrapper } = setup();

    const { result } = renderHook(() => useWarehouseRights(), { wrapper });

    await waitFor(() => expect(result.current.delete).toBe(true));
  });
});

describe('warehouse mutations', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.patch).mockReset();
  });

  it('shows the change in the open list after a warehouse is switched off', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(listBody(['Gudang Utama', 'Gudang Lt. 2']) as never)
      .mockResolvedValue(listBody(['Gudang Utama']) as never);
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { data: {} } } as never);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({ list: useWarehouseList({ page: 1 }), actions: useWarehouseMutations() }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.list.data?.items).toHaveLength(2));

    act(() => result.current.actions.setActive.mutate({ id: 'w1', isActive: false }));

    await waitFor(() => expect(result.current.list.data?.items).toHaveLength(1));
    expect(apiClient.patch).toHaveBeenCalledWith('/v1/warehouses/w1/status', {
      status: 'inactive',
    });
  });
});
