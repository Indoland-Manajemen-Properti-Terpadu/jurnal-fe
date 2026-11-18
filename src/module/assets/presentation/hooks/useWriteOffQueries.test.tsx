import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useApproveWriteOff, useRunDepreciation } from './useWriteOffQueries';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const setup = () => {
  const client = new QueryClient();
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const invalidated = () => invalidate.mock.calls.map(([filters]) => filters?.queryKey);
  return { wrapper, invalidated };
};

const LEDGER = [
  ['accounts'],
  ['transaction_by_account'],
  ['journal_history'],
  ['trial-balance'],
  ['general-ledger'],
];

describe('what a posted write-off refreshes', () => {
  it('refreshes the journals and ledger reports after an approval', async () => {
    http.post.mockResolvedValue({ data: { data: { id: 'r1', number: 'BA/1' } } });
    const { wrapper, invalidated } = setup();
    const { result } = renderHook(() => useApproveWriteOff('r1'), { wrapper });
    result.current.mutate({ signature: new Blob(['s']), note: '' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    LEDGER.forEach((key) => expect(invalidated()).toContainEqual(key));
  });

  it('refreshes them after posting depreciation too', async () => {
    http.post.mockResolvedValue({ data: { data: { upTo: '2026-10', plan: [] } } });
    const { wrapper, invalidated } = setup();
    const { result } = renderHook(() => useRunDepreciation(), { wrapper });
    result.current.mutate({ upTo: '2026-10' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    LEDGER.forEach((key) => expect(invalidated()).toContainEqual(key));
  });
});
