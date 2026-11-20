import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@test-utils';
import { cancelReconciliationMatch } from '../../infrastructure/matchApi';
import { useCancelReconciliation } from './useCancelReconciliation';

vi.mock('../../infrastructure/matchApi', () => ({
  cancelReconciliationMatch: vi.fn().mockResolvedValue({}),
  fetchMatchIdsForJournal: vi.fn(),
}));

describe('useCancelReconciliation', () => {
  it('reads the journal detail and lists again, because the journal is no longer locked', async () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCancelReconciliation(), { wrapper });
    result.current.mutate('m-1');
    await waitFor(() => expect(cancelReconciliationMatch).toHaveBeenCalledWith('m-1'));
    await waitFor(() => expect(invalidate).toHaveBeenCalled());
    const keys = invalidate.mock.calls.map(([filters]) => (filters?.queryKey as string[])[0]);
    expect(keys).toEqual(
      expect.arrayContaining([
        'detail_transaction',
        'journal_history',
        'journal_matches',
        'bank_statement',
      ])
    );
  });
});
