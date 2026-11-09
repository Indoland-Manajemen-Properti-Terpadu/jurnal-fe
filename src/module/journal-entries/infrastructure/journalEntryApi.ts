import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT, API_TAGS } from '@/lib/http/endpoints';
import type { JournalHistoryFilters, JournalHistoryPage } from '../domain/journalHistory';
import { toHistoryQuery } from '../domain/journalHistory';
import type {
  JournalEntryByAccount,
  JournalEntryDetail,
  JournalEntryPayload,
  TagsResponse,
} from '../domain/journalEntry';
import { toJournalHistoryPage } from './journalHistoryMapper';
import {
  toCreateFormData,
  toEntriesByAccount,
  toEntryDetail,
  toTotalPages,
} from './journalEntryMapper';

/** The server's own message of a failed request, or the fallback. */
export const errorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || error.message || fallback
    : fallback;

export const fetchJournalEntryDetail = async (idEntry: string): Promise<JournalEntryDetail> => {
  const { data } = await apiClient.get<unknown>(`${API_ACCOUNT.GET_TRANSACTION_DETAIL}/${idEntry}`);
  return toEntryDetail(data);
};

/** One page of the journal across every account, filtered and sorted by the server. */
export const fetchJournalHistory = async (
  filters: JournalHistoryFilters,
  signal?: AbortSignal
): Promise<JournalHistoryPage> => {
  const { data } = await apiClient.get<unknown>(
    `${API_ACCOUNT.GET_JOURNALS}?${toHistoryQuery(filters).toString()}`,
    { signal }
  );
  return toJournalHistoryPage(data);
};

const ENTRIES_PAGE_SIZE = 100;

export const fetchJournalEntriesByAccount = async (
  idAccount: string
): Promise<JournalEntryByAccount[]> => {
  const url = `${API_ACCOUNT.GET_TRANSACTION_BY_ACCOUNT}/${idAccount}`;
  const fetchPage = async (page: number) =>
    (await apiClient.get<unknown>(`${url}?limit=${ENTRIES_PAGE_SIZE}&page=${page}`)).data;

  // The server pages the list (10 by default), so every page is read: the table, the balance
  // and the journal count of the ledger must not stop at the newest ones.
  const first = await fetchPage(1);
  const entries = toEntriesByAccount(first);
  const pages = toTotalPages(first);
  for (let page = 2; page <= pages; page += 1) {
    entries.push(...toEntriesByAccount(await fetchPage(page)));
  }
  return entries;
};

/** Creates a journal entry. Any successful HTTP 2xx response is accepted. */
export const createJournalEntry = async (payload: JournalEntryPayload): Promise<unknown> => {
  let response;
  try {
    response = await apiClient.post<unknown>(
      API_ACCOUNT.POST_TRANSACTION_ACCOUNT,
      toCreateFormData(payload)
    );
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error) && error.response) {
      throw new Error(error.response.data?.message ?? error.response.statusText ?? 'Unknown Error');
    }
    throw error;
  }
  if (response.status < 200 || response.status >= 300) {
    const body = response.data as { message?: string } | null;
    throw new Error(body?.message ?? response.statusText ?? 'Unknown Error');
  }
  return response.data;
};

/** The id the server gave the entry it just created (`{ data: { id } }`), if it sent one. */
export const createdEntryId = (response: unknown): string | undefined =>
  (response as { data?: { id?: string } } | null)?.data?.id;

/** Cancels an entry: it becomes `VOID` and the server posts a `REVERSAL` entry. Not reversible. */
export const voidJournalEntry = async (idEntry: string): Promise<unknown> => {
  const { data } = await apiClient.post<unknown>(
    `${API_ACCOUNT.DEL_TRANSACTION_ACCOUNT}/${idEntry}/void`
  );
  return data;
};

export interface VoidManyResult {
  voided: number;
  failed: number;
}

/**
 * Voids the entries one after the other. The backend is not safe for a parallel batch (a partly
 * failing one answers 500), and a failure must not stop the entries after it.
 */
export const voidJournalEntries = async (ids: string[]): Promise<VoidManyResult> => {
  const result: VoidManyResult = { voided: 0, failed: 0 };
  for (const id of ids) {
    try {
      await voidJournalEntry(id);
      result.voided += 1;
    } catch {
      result.failed += 1;
    }
  }
  return result;
};

export const fetchTags = async (page: number): Promise<TagsResponse> => {
  const { data } = await apiClient.get<TagsResponse>(`${API_TAGS.GET_ALL_TAGS}?page=${page}`);
  return data;
};

export interface CreatedTag {
  data?: { id?: string };
}

export const createTag = async (name: string): Promise<CreatedTag> => {
  const { data } = await apiClient.post<CreatedTag>(API_TAGS.POST_TAG, { name });
  return data;
};
