import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import apiClient from '@/lib/http/apiClient';
import { useCreateTax, useDeleteTax, useTaxes } from './useTaxes';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
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

describe('tax hooks', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.delete).mockReset();
    vi.mocked(notifications.show).mockReset();
  });

  it('refreshes the tax list and shows a success message after creating a tax', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data: { id: 't1' } } } as never);
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useCreateTax(), { wrapper });

    act(() => result.current.mutate({ name: 'PPN', rate: 11 }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['settings', 'taxes'] });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'teal', message: 'Pajak berhasil ditambahkan.' })
    );
  });

  it('shows an error and does not refresh the list when deleting a tax fails', async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(new Error('boom'));
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useDeleteTax(), { wrapper });

    act(() => result.current.mutate('t1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidate).not.toHaveBeenCalled();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', message: 'Gagal menghapus pajak.' })
    );
  });

  it('loads the tax list through the settings query key', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: [{ id: 't1', name: 'PPN', rate: 11 }] },
    } as never);
    const { wrapper } = setup();
    const { result } = renderHook(() => useTaxes(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ id: 't1', name: 'PPN', rate: 11 }]);
  });
});
