import { vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import type { JournalEntryPayload } from '../domain/journalEntry';
import { createJournalEntry, deleteJournalEntries } from './journalEntryApi';

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

describe('deleteJournalEntries (not atomic)', () => {
  it('sends one DELETE per id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });
    await deleteJournalEntries(['a', 'b', 'c']);
    expect(apiClient.delete).toHaveBeenCalledTimes(3);
  });

  it('rejects when any request fails', async () => {
    vi.mocked(apiClient.delete)
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error('boom'));
    await expect(deleteJournalEntries(['a', 'b'])).rejects.toThrow('boom');
  });
});
