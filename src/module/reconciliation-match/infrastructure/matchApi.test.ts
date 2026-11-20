import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { cancelReconciliationMatch, fetchMatchIdsForJournal } from './matchApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn(), delete: vi.fn() } }));

describe('reconciliation match api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels a match by id, without a body', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { data: { matchId: 'm-1' } } });
    await cancelReconciliationMatch('m-1');
    expect(vi.mocked(apiClient.delete).mock.calls[0]).toEqual([
      expect.stringContaining('/v1/reconciliation/cancel/m-1'),
    ]);
  });

  it('lists the match ids of a journal, and none when it is not reconciled', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: [{ id: 'm-1' }, { id: 'm-2' }] },
    });
    expect(await fetchMatchIdsForJournal('j-1')).toEqual(['m-1', 'm-2']);
    expect(vi.mocked(apiClient.get).mock.calls[0][1]).toEqual({ params: { journalId: 'j-1' } });

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [] } });
    expect(await fetchMatchIdsForJournal('j-2')).toEqual([]);
  });
});
