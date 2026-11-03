import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT, API_TAGS } from '@/lib/http/endpoints';
import type {
  JournalEntryByAccount,
  JournalEntryDetail,
  JournalEntryPayload,
  TagsResponse,
} from '../domain/journalEntry';
import { toCreateFormData, toEntriesByAccount, toEntryDetail } from './journalEntryMapper';

/** The server's own message of a failed request, or the fallback. */
export const errorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || error.message || fallback
    : fallback;

export const fetchJournalEntryDetail = async (idEntry: string): Promise<JournalEntryDetail> => {
  const { data } = await apiClient.get<unknown>(`${API_ACCOUNT.GET_TRANSACTION_DETAIL}/${idEntry}`);
  return toEntryDetail(data);
};

export const fetchJournalEntriesByAccount = async (
  idAccount: string
): Promise<JournalEntryByAccount[]> => {
  const { data } = await apiClient.get<unknown>(
    `${API_ACCOUNT.GET_TRANSACTION_BY_ACCOUNT}/${idAccount}`
  );
  return toEntriesByAccount(data);
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

export const deleteJournalEntry = async (idEntry: string): Promise<unknown> => {
  const { data } = await apiClient.delete<unknown>(
    `${API_ACCOUNT.DEL_TRANSACTION_ACCOUNT}/${idEntry}`
  );
  return data;
};

/** Not atomic: N parallel DELETE requests. If one fails the others may already have gone through. */
export const deleteJournalEntries = (ids: string[]): Promise<unknown[]> =>
  Promise.all(ids.map(deleteJournalEntry));

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
