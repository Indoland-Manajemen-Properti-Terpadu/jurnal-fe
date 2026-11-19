import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import apiClient from '@/lib/http/apiClient';
import type { PaymentTermPayload } from '@/module/settings/domain/paymentTerm';
import {
  useCreatePaymentTerm,
  useDeletePaymentTerm,
  usePaymentTermDetail,
  usePaymentTermList,
  useSetPaymentTermStatus,
  useUpdatePaymentTerm,
} from './usePaymentTermQueries';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const payload: PaymentTermPayload = {
  name: 'Net 30',
  appliesTo: 'both',
  advanceType: 'none',
  billingSplit: 'single',
  hasDueTerm: true,
  hasRetention: false,
};

/** The shape of a failed HTTP call, without importing the HTTP library into presentation code. */
const apiError = (status: number, message?: string) =>
  Object.assign(new Error('failed'), {
    isAxiosError: true,
    response: { status, data: { message } },
  });

const setup = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { wrapper, invalidate };
};

const LIST = ['settings', 'payment-terms'];

beforeEach(() => {
  Object.values(vi.mocked(apiClient)).forEach((fn) => fn.mockReset());
  vi.mocked(notifications.show).mockReset();
});

describe('usePaymentTermList', () => {
  it('loads a page of terms with the filters in the request', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: {
          data: [{ id: 't1', name: 'Net 30' }],
          pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
        },
      },
    } as never);
    const { wrapper } = setup();
    const { result } = renderHook(() => usePaymentTermList({ q: 'net', isActive: true }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith('/v1/settings/payment-terms', {
      params: { q: 'net', isActive: true },
    });
    expect(result.current.data?.items[0]).toMatchObject({ id: 't1', name: 'Net 30' });
    expect(result.current.data?.pagination.total).toBe(1);
  });
});

describe('usePaymentTermDetail', () => {
  it('loads one term', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { id: 't1', name: 'Net 30', usageCount: 4 } },
    } as never);
    const { wrapper } = setup();
    const { result } = renderHook(() => usePaymentTermDetail('t1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith('/v1/settings/payment-terms/t1');
    expect(result.current.data?.usageCount).toBe(4);
  });

  it('does not ask for a term while there is no id (add page)', () => {
    const { wrapper } = setup();
    renderHook(() => usePaymentTermDetail(undefined), { wrapper });

    expect(apiClient.get).not.toHaveBeenCalled();
  });
});

describe('useCreatePaymentTerm', () => {
  it('refreshes the terms and shows a success message', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data: { id: 't1' } } } as never);
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useCreatePaymentTerm(), { wrapper });

    act(() => result.current.mutate(payload));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.post).toHaveBeenCalledWith('/v1/settings/payment-terms', payload);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: LIST });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'teal', message: 'Syarat pembayaran berhasil ditambahkan.' })
    );
  });

  it('shows the message of the API when it rejects the term, for example a duplicate name', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(apiError(400, 'Nama termin sudah dipakai'));
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useCreatePaymentTerm(), { wrapper });

    act(() => result.current.mutate(payload));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidate).not.toHaveBeenCalled();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', message: 'Nama termin sudah dipakai' })
    );
  });

  it('shows a plain message when the failure has nothing readable from the API', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('Network Error'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useCreatePaymentTerm(), { wrapper });

    act(() => result.current.mutate(payload));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', message: 'Gagal menambahkan syarat pembayaran.' })
    );
  });

  it('does not show a message from the API for a server failure', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(apiError(500, 'Internal error at db.collection'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useCreatePaymentTerm(), { wrapper });

    act(() => result.current.mutate(payload));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Gagal menambahkan syarat pembayaran.' })
    );
  });
});

describe('useUpdatePaymentTerm', () => {
  it('sends the whole term to its own address and refreshes', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { data: { id: 't1' } } } as never);
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useUpdatePaymentTerm(), { wrapper });

    act(() => result.current.mutate({ id: 't1', payload }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.put).toHaveBeenCalledWith('/v1/settings/payment-terms/t1', payload);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: LIST });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Syarat pembayaran berhasil diperbarui.' })
    );
  });
});

describe('useSetPaymentTermStatus', () => {
  it('says activated and deactivated according to the new status', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { data: { id: 't1' } } } as never);
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useSetPaymentTermStatus(), { wrapper });

    act(() => result.current.mutate({ id: 't1', isActive: false }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.patch).toHaveBeenCalledWith('/v1/settings/payment-terms/t1/status', {
      isActive: false,
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: LIST });
    expect(notifications.show).toHaveBeenLastCalledWith(
      expect.objectContaining({ message: 'Syarat pembayaran dinonaktifkan.' })
    );

    act(() => result.current.mutate({ id: 't1', isActive: true }));
    await waitFor(() =>
      expect(notifications.show).toHaveBeenLastCalledWith(
        expect.objectContaining({ message: 'Syarat pembayaran diaktifkan.' })
      )
    );
  });

  it('shows an error and keeps the list as it is when the change fails', async () => {
    vi.mocked(apiClient.patch).mockRejectedValue(new Error('boom'));
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useSetPaymentTermStatus(), { wrapper });

    act(() => result.current.mutate({ id: 't1', isActive: false }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidate).not.toHaveBeenCalled();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: 'red',
        message: 'Gagal mengubah status syarat pembayaran.',
      })
    );
  });
});

describe('useDeletePaymentTerm', () => {
  it('refreshes the terms and shows a success message', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: {} } as never);
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useDeletePaymentTerm(), { wrapper });

    act(() => result.current.mutate('t1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.delete).toHaveBeenCalledWith('/v1/settings/payment-terms/t1');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: LIST });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Syarat pembayaran berhasil dihapus.' })
    );
  });

  it('leaves a 409 to the screen: no message here, the error stays readable for the dialog', async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(apiError(409, 'Termin sudah dipakai'));
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useDeletePaymentTerm(), { wrapper });

    act(() => result.current.mutate('t1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(notifications.show).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
    expect(result.current.error).toMatchObject({ response: { status: 409 } });
  });

  it('shows a plain message for any other failure', async () => {
    vi.mocked(apiClient.delete).mockRejectedValue(apiError(500, 'stack trace here'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useDeletePaymentTerm(), { wrapper });

    act(() => result.current.mutate('t1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', message: 'Gagal menghapus syarat pembayaran.' })
    );
  });
});
