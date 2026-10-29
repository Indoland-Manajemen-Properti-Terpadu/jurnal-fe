import { ReactNode } from 'react';
import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { useReconciliation } from './useReconciliation';
import { useJournalDetailsForRecon } from './useJournalDetailsForRecon';

vi.mock('@/lib/http/apiClient', () => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

const line = (debit: number, credit: number) => ({ journalDetail: { debit, credit } });

describe('useReconciliation balance (characterization)', () => {
  const load = async (response: unknown) => {
    vi.mocked(get).mockResolvedValue(response);
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
    vi.mocked(get).mockResolvedValue(response);
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
