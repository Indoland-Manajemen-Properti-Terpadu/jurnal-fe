import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';
import type { DraftBalance } from '../domain/beginningBalance';
import { toDraftBalance } from './draftBalanceMapper';

export type BalancePayload = {
  period: string;
  balances: unknown[];
  accounts: unknown[];
};

/**
 * An HTTP error body is still read as the draft: the General Journal page opens the start modal
 * when the body says `status: false` (no draft yet). Network errors reach TanStack Query.
 */
export const fetchDraftBalance = async (): Promise<DraftBalance | undefined> => {
  try {
    const { data } = await apiClient.get<unknown>(API_ACCOUNT.GET_DRAFT_BALANCE);
    return toDraftBalance(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return toDraftBalance({ data: error.response.data });
    }
    throw error;
  }
};

export type DraftBalanceLog = {
  id?: string;
  _id?: string;
  action?: string;
  createdAt: string;
  period?: string;
  performedBy?: { name?: string; email?: string };
  balances?: { debit?: number | string; credit?: number | string }[];
};

export const fetchDraftBalanceLogs = async (): Promise<DraftBalanceLog[]> => {
  const { data } = await apiClient.get<DraftBalanceLog[] | { data?: DraftBalanceLog[] }>(
    API_ACCOUNT.GET_DRAFT_BALANCE_LOGS
  );
  return Array.isArray(data) ? data : data?.data || [];
};

export const saveDraftBalance = async (payload: BalancePayload) => {
  const { data } = await apiClient.post<unknown>(API_ACCOUNT.POST_DRAFT_BALANCE, payload);
  return data;
};

export const publishBalance = async (payload: BalancePayload) => {
  const { data } = await apiClient.post<unknown>(API_ACCOUNT.POST_PUBLISH_DRAFT_BALANCE, payload);
  return data;
};

/** The server's own message of a failed request, or the fallback. */
export const errorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
