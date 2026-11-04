import { vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import type { JournalEntryPayload } from '../domain/journalEntry';
import {
  createJournalEntry,
  fetchJournalEntriesByAccount,
  voidJournalEntries,
} from './journalEntryApi';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const payload: JournalEntryPayload = {
  transactionDate: '2026-05-01',
  transactionDetail: [{ account: 'a', description: '', debit: 10, credit: 0 }],
  notes: '',
  attachments: [],
  tags: [],
};

describe('createJournalEntry', () => {
  it('resolves with the body on 200', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ status: 200, data: { ok: true } });
    await expect(createJournalEntry(payload)).resolves.toEqual({ ok: true });
  });

  it('resolves with the body when the server creates an entry with HTTP 201', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      status: 201,
      statusText: 'Created',
      data: { message: 'Journal transaction created successfully' },
    });
    await expect(createJournalEntry(payload)).resolves.toEqual({
      message: 'Journal transaction created successfully',
    });
  });

  it('rejects with the server message on an error status', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: { status: 400, statusText: 'Bad Request', data: { message: 'Unbalanced' } },
      })
    );
    await expect(createJournalEntry(payload)).rejects.toThrow('Unbalanced');
  });
});

describe('voidJournalEntries', () => {
  it('posts one void per id, one after the other', async () => {
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
    const result = await voidJournalEntries(['a', 'b', 'c']);
    expect(result).toEqual({ voided: 3, failed: 0 });
    expect(vi.mocked(apiClient.post).mock.calls.map(([url]) => url)).toEqual([
      expect.stringMatching(/\/a\/void$/),
      expect.stringMatching(/\/b\/void$/),
      expect.stringMatching(/\/c\/void$/),
    ]);
  });

  it('keeps going after a failure and counts it', async () => {
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ data: {} });
    expect(await voidJournalEntries(['a', 'b', 'c'])).toEqual({ voided: 2, failed: 1 });
    expect(apiClient.post).toHaveBeenCalledTimes(3);
  });
});

describe('fetchJournalEntriesByAccount', () => {
  const page = (rows: string[], totalPages: number) => ({
    data: { data: { results: rows.map((id) => ({ id })), totalPages } },
  });

  it('reads every page, so entries beyond the first page are not lost', async () => {
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValueOnce(page(['a', 'b'], 2))
      .mockResolvedValueOnce(page(['c'], 2));
    const entries = await fetchJournalEntriesByAccount('acc');
    expect(entries.map((e) => e.id)).toEqual(['a', 'b', 'c']);
    expect(vi.mocked(apiClient.get).mock.calls.map(([url]) => url)).toEqual([
      expect.stringMatching(/\/acc\?limit=100&page=1$/),
      expect.stringMatching(/\/acc\?limit=100&page=2$/),
    ]);
  });

  it('makes one request when the answer is not paged', async () => {
    vi.mocked(apiClient.get)
      .mockReset()
      .mockResolvedValueOnce({ data: { data: [{ id: 'a' }] } });
    expect(await fetchJournalEntriesByAccount('acc')).toHaveLength(1);
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });
});
