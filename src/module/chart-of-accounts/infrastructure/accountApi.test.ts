import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ACCOUNT } from '@/services/endpoint';
import { getJournalAccounts } from './accountApi';

const http = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('@/lib/http/apiClient', () => ({ default: http }));

describe('getJournalAccounts', () => {
  beforeEach(() => {
    http.get.mockReset();
  });

  it('returns the results array as is', async () => {
    const results = [{ id: 'a1', name: 'Kas', amount: 0, debit: 0, credit: 0 }];
    http.get.mockResolvedValue({ data: { results } });

    await expect(getJournalAccounts()).resolves.toEqual(results);
    expect(http.get).toHaveBeenCalledWith(API_ACCOUNT.GET_ALL_ACCOUNT, { params: undefined });
  });

  it('forwards the showArchived param', async () => {
    http.get.mockResolvedValue({ data: { results: [] } });

    await getJournalAccounts({ showArchived: 1 });
    expect(http.get).toHaveBeenCalledWith(API_ACCOUNT.GET_ALL_ACCOUNT, {
      params: { showArchived: 1 },
    });
  });

  it.each([{ data: {} }, { data: { results: null } }, { data: undefined }])(
    'throws on a bad shape %#',
    async (response) => {
      http.get.mockResolvedValue(response);
      await expect(getJournalAccounts()).rejects.toThrow('Invalid journal accounts response.');
    }
  );
});
