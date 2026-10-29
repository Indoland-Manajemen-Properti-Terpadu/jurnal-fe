import { ReactNode } from 'react';
import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '@/lib/http/apiClient';
import { useReconciliation } from './useReconciliation';
import { useJournalDetailsForRecon } from './useJournalDetailsForRecon';
import { useMatchReconciliation } from './useMatchReconciliation';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

const line = (debit: number, credit: number) => ({ journalDetail: { debit, credit } });

describe('useReconciliation balance (characterization)', () => {
  const load = async (response: unknown) => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: response });
    const { result } = renderHook(() => useReconciliation('acc-1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    return result.current.data;
  };

  it('keeps the balance sent by the server', async () => {
    const data = await load({ data: { bankStatements: [], balance: 250.5 } });
    expect(data?.balance).toBe(250.5);
  });

  it('derives the balance from the top recommendation of each statement only', async () => {
    const data = await load({
      data: {
        bankStatements: [
          { id: 'a', recommendations: [line(100.1, 0), line(999, 0)] },
          { id: 'b', recommendations: [line(0, 40.2)] },
          { id: 'c', recommendations: [] },
          { id: 'd' },
        ],
      },
    });
    expect(data?.balance).toBeCloseTo(59.9, 10);
  });

  it('reads an unwrapped response and defaults the balance to 0', async () => {
    const data = await load({ bankStatements: [] });
    expect(data?.balance).toBe(0);
  });
});

describe('useJournalDetailsForRecon shapes (characterization)', () => {
  const load = async (response: unknown) => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: response });
    const { result } = renderHook(() => useJournalDetailsForRecon('bs-1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    return result.current.data;
  };

  it.each([
    ['data.results', { data: { results: [{ id: 'x' }] } }],
    ['results', { results: [{ id: 'x' }] }],
    ['data array', { data: [{ id: 'x' }] }],
    ['bare array', [{ id: 'x' }]],
  ])('reads rows from %s', async (_name, response) => {
    expect(await load(response)).toEqual([{ id: 'x' }]);
  });

  it('returns an empty list for an unknown shape', async () => {
    expect(await load({ foo: 1 })).toEqual([]);
  });
});

describe('useMatchReconciliation', () => {
  const run = async (outcome: 'ok' | 'fail') => {
    if (outcome === 'ok') {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { code: 200 } });
    } else {
      vi.mocked(apiClient.post).mockRejectedValue(
        Object.assign(new Error('Request failed'), {
          isAxiosError: true,
          response: { status: 400, data: { message: 'Jumlah tidak sama' } },
        })
      );
    }
    vi.mocked(notifications.show).mockClear();
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = renderHook(() => useMatchReconciliation(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    result.current.mutate({ matches: [{ bankStatementId: 'b', journalDetailIds: ['j'] }] });
    await waitFor(() => expect(notifications.show).toHaveBeenCalled());
    return { invalidate };
  };

  it('posts the payload to match-multiple and refreshes the live keys on success', async () => {
    const { invalidate } = await run('ok');
    expect(apiClient.post).toHaveBeenCalledWith(expect.stringContaining('match-multiple'), {
      matches: [{ bankStatementId: 'b', journalDetailIds: ['j'] }],
    });
    const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey);
    expect(keys).toEqual([
      ['get_reconciliation'],
      ['bank_statement'],
      ['journal_details_for_recon'],
      ['transaction_by_account'],
      ['detail_account'],
    ]);
  });

  it('shows the server message and no success toast when the request fails', async () => {
    const { invalidate } = await run('fail');
    expect(notifications.show).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notifications.show).mock.calls[0][0]).toMatchObject({
      message: 'Jumlah tidak sama',
    });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
