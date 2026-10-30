import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ACCOUNT } from '@/services/endpoint';
import { archiveAccount, getDetailAccount } from './accountDetailApi';
import { createAccount, deleteAccounts, getJournalAccounts, updateAccount } from './accountApi';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

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

describe('account mutations (R3: errors reach the caller)', () => {
  const payload = { name: 'Kas', accountNumber: '1-10001', category: 'c1', isAllUser: true };

  beforeEach(() => {
    Object.values(http).forEach((fn) => fn.mockReset());
  });

  it('create posts the payload to the add endpoint and returns the body', async () => {
    http.post.mockResolvedValue({ data: { id: 'a1' } });
    await expect(createAccount(payload)).resolves.toEqual({ id: 'a1' });
    expect(http.post).toHaveBeenCalledWith(API_ACCOUNT.ADD_ACCOUNT, payload);
  });

  it('update patches the account url', async () => {
    http.patch.mockResolvedValue({ data: { ok: true } });
    await updateAccount('a1', payload);
    expect(http.patch).toHaveBeenCalledWith(`${API_ACCOUNT.ADD_ACCOUNT}/a1`, payload);
  });

  it('delete sends the ids as the request body', async () => {
    http.delete.mockResolvedValue({ data: {} });
    await deleteAccounts({ accountIds: ['a1', 'a2'] });
    expect(http.delete).toHaveBeenCalledWith(API_ACCOUNT.DELETE_ACCOUNT, {
      data: { accountIds: ['a1', 'a2'] },
    });
  });

  it('archive patches the archive endpoint of the account', async () => {
    http.patch.mockResolvedValue({ data: {} });
    await archiveAccount('a1');
    expect(http.patch).toHaveBeenCalledWith(
      API_ACCOUNT.ARCHIVE_ACCOUNT.replace(':accountId', 'a1'),
      {}
    );
  });

  it('rejects on an HTTP error instead of resolving with the error response', async () => {
    const error = Object.assign(new Error('Request failed'), { response: { status: 400 } });
    http.post.mockRejectedValue(error);
    http.patch.mockRejectedValue(error);
    http.delete.mockRejectedValue(error);

    await expect(createAccount(payload)).rejects.toBe(error);
    await expect(updateAccount('a1', payload)).rejects.toBe(error);
    await expect(deleteAccounts({ accountIds: ['a1'] })).rejects.toBe(error);
    await expect(archiveAccount('a1')).rejects.toBe(error);
  });
});

describe('getDetailAccount', () => {
  beforeEach(() => {
    http.get.mockReset();
  });

  it('returns the response body from the detail endpoint', async () => {
    const body = { data: { id: 'a1', name: 'Kas' } };
    http.get.mockResolvedValue({ data: body });

    await expect(getDetailAccount('a1')).resolves.toEqual(body);
    expect(http.get).toHaveBeenCalledWith(`${API_ACCOUNT.GET_DETAIL_ACCOUNT}/a1`, {
      params: undefined,
    });
  });

  it('rejects on an HTTP error instead of returning the error response', async () => {
    http.get.mockRejectedValue(new Error('500'));

    await expect(getDetailAccount('a1')).rejects.toThrow('500');
  });
});
