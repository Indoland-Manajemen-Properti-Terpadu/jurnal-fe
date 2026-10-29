import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useJournalAccounts } from './useJournalAccounts';

const api = vi.hoisted(() => ({ getJournalAccounts: vi.fn() }));

vi.mock('@/module/chart-of-accounts/infrastructure/accountApi', () => api);

const setup = (showArchived?: boolean) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(() => useJournalAccounts(showArchived), { wrapper }) };
};

describe('useJournalAccounts', () => {
  beforeEach(() => {
    api.getJournalAccounts.mockReset();
  });

  it('exposes accounts and uses the ["accounts", showArchived] key', async () => {
    api.getJournalAccounts.mockResolvedValue([{ id: '1', name: 'Kas' }]);
    const { result, client } = setup();

    await waitFor(() => expect(result.current.accounts).toHaveLength(1));
    expect(api.getJournalAccounts).toHaveBeenCalledWith({});
    expect(client.getQueryData(['accounts', false])).toBeDefined();
  });

  it('requests archived accounts when asked', async () => {
    api.getJournalAccounts.mockResolvedValue([]);
    const { result } = setup(true);

    await waitFor(() => expect(result.current.isEmpty).toBe(true));
    expect(api.getJournalAccounts).toHaveBeenCalledWith({ showArchived: 1 });
  });

  it('reports isError and an empty list on failure', async () => {
    api.getJournalAccounts.mockRejectedValue(new Error('boom'));
    const { result } = setup();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.accounts).toEqual([]);
    expect(result.current.isEmpty).toBe(false);
  });
});
