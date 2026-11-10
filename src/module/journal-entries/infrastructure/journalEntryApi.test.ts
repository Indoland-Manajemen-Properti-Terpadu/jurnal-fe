import { vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import type { JournalEntryPayload } from '../domain/journalEntry';
import { emptyHistoryFilters } from '../domain/journalHistory';
import {
  createJournalEntry,
  JournalExportError,
  exportJournalHistory,
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

describe('exportJournalHistory', () => {
  const filters = {
    ...emptyHistoryFilters(),
    page: 3,
    limit: 50,
    startDate: '2026-11-01',
    endDate: '2026-11-10',
    status: ['VOID' as const],
    search: 'denda',
  };

  it('sends the active filters without paging and names the file from the server', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: new Blob(['x']),
      headers: { 'content-disposition': 'attachment; filename="journal-20261101-20261110.csv"' },
    });
    const result = await exportJournalHistory(filters, 'csv', 'gagal');

    const url = String(vi.mocked(apiClient.get).mock.calls.at(-1)?.[0]);
    expect(url.startsWith('/v1/journal/export/csv?')).toBe(true);
    expect(url).toContain('startDate=2026-11-01');
    expect(url).toContain('endDate=2026-11-10');
    expect(url).toContain('status=VOID');
    expect(url).toContain('search=denda');
    expect(url).not.toContain('page=');
    expect(url).not.toContain('limit=');
    expect(result.filename).toBe('journal-20261101-20261110.csv');
  });

  it('falls back to a name built from the dates', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: new Blob(['x']), headers: {} });
    const result = await exportJournalHistory(filters, 'xlsx', 'gagal');
    expect(result.filename).toBe('journal-20261101-20261110.xlsx');
  });

  it('shows the message the server put in the blob of a failed download', async () => {
    const body = new Blob([JSON.stringify({ message: 'Rentang waktu maksimal adalah 1 tahun' })]);
    vi.mocked(apiClient.get).mockRejectedValue(
      Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: { status: 400, data: body },
      })
    );
    await expect(exportJournalHistory(filters, 'pdf', 'gagal')).rejects.toThrow(
      'Rentang waktu maksimal adalah 1 tahun'
    );
  });

  it('carries the status, so a 400 refusal can be told from a fault', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: {
          status: 400,
          data: new Blob([JSON.stringify({ message: 'Jumlah jurnal (4433) melebihi batas 2000' })]),
        },
      })
    );
    const error = await exportJournalHistory(filters, 'pdf', 'gagal').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(JournalExportError);
    expect((error as JournalExportError).status).toBe(400);
    expect((error as JournalExportError).message).toBe('Jumlah jurnal (4433) melebihi batas 2000');
  });
});
