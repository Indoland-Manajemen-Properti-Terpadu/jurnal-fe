import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import apiClient from '@/lib/http/apiClient';
import { useCreateDepartment, useDepartmentList, useUpdateDepartment } from './useDepartments';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const page = (names: string[]) => ({
  data: {
    data: {
      results: names.map((name, index) => ({ id: `d${index}`, name })),
      page: 1,
      totalPages: 1,
      totalResults: names.length,
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

const input = { name: 'Logistik', code: '', description: '', isActive: true };

describe('department hooks', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.put).mockReset();
    vi.mocked(notifications.show).mockReset();
  });

  it('shows the new department in the open list after creating one', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(page(['Engineering']) as never)
      .mockResolvedValue(page(['Engineering', 'Logistik']) as never);
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { data: { id: 'd9', name: 'Logistik' } },
    } as never);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({ list: useDepartmentList({ search: '', page: 1 }), create: useCreateDepartment() }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.list.data?.items).toHaveLength(1));

    act(() => result.current.create.mutate(input));

    await waitFor(() => expect(result.current.list.data?.items).toHaveLength(2));
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'teal', message: 'Departemen berhasil ditambahkan.' })
    );
  });

  it('keeps the list and shows no success message when a write is refused', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(page(['Engineering']) as never);
    vi.mocked(apiClient.put).mockRejectedValue(new Error('boom'));
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({ list: useDepartmentList(), update: useUpdateDepartment() }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

    act(() => result.current.update.mutate({ id: 'd0', input: { isActive: false } }));
    await waitFor(() => expect(result.current.update.isError).toBe(true));

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(notifications.show).not.toHaveBeenCalled();
  });
});
