import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import apiClient from '@/lib/http/apiClient';
import { useBankCashTransactionMutation } from './useBankCashTransactionMutation';

vi.mock('@/lib/http/apiClient', () => ({ default: { post: vi.fn() } }));

const post = vi.mocked(apiClient.post);
/** What the shared client rejects with on an HTTP error (axios.isAxiosError looks at this flag). */
const httpError = (status: number, data: unknown) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { status, statusText: '', data },
  });
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));

const payload = {
  transactionDate: '2026-01-31',
  transactionDetail: [{ account: 'cash', description: 'x', debit: 1 }],
};

const setup = () => {
  const client = new QueryClient();
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  const hook = renderHook(() => useBankCashTransactionMutation('Berhasil'), { wrapper });
  return { hook, invalidate };
};

describe('useBankCashTransactionMutation', () => {
  beforeEach(() => {
    post.mockReset();
    vi.mocked(notifications.show).mockReset();
    navigate.mockReset();
  });

  it('refreshes the account and journal queries and returns to cash and bank on success', async () => {
    post.mockResolvedValue({ status: 201, data: {} } as never);
    const { hook, invalidate } = setup();

    act(() => hook.result.current.mutate(payload));
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(invalidate.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      ['accounts'],
      ['journal_transactions'],
      ['detail_account'],
    ]);
    expect(navigate).toHaveBeenCalledWith('/bank-cash');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'teal', message: 'Berhasil' })
    );
  });

  it('shows the error and stays on the form when the post fails', async () => {
    post.mockRejectedValue(httpError(400, { message: 'Periode terkunci' }));
    const { hook, invalidate } = setup();

    act(() => hook.result.current.mutate(payload));
    await waitFor(() => expect(hook.result.current.isError).toBe(true));

    expect(invalidate).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'red', message: 'Periode terkunci' })
    );
  });
});
