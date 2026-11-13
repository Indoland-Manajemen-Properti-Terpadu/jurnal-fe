import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/lib/http/endpoints';
import type { BalanceLine } from '../domain/openingBalanceRules';
import type { BalanceLog, DraftBalance, SimpleAccount } from '../domain/beginningBalance';
import {
  toDateLocked,
  toDraftBalance,
  toFirstJournalDay,
  toSimpleAccounts,
} from './draftBalanceMapper';

export type BalancePayload = {
  period: string;
  balances: BalanceLine[];
};

/** Whether a date falls in a locked accounting period. */
export const fetchDateLocked = async (date: string): Promise<boolean> => {
  const { data } = await apiClient.get<unknown>(API_ACCOUNT.GET_ACCOUNTING_PERIOD_CHECK, {
    params: { date },
  });
  return toDateLocked(data);
};

/**
 * The day of the earliest journal. The draft only carries `firstTransactionDate` once a draft
 * exists, so a site that has not started yet reads it here to know the latest day it may pick.
 */
export const fetchFirstJournalDay = async (): Promise<string | null> => {
  const { data } = await apiClient.get<unknown>(API_ACCOUNT.GET_JOURNALS, {
    params: { limit: 1, sortBy: 'transactionDate:asc' },
  });
  return toFirstJournalDay(data);
};

/** Every account of the chart (id, name, code, side, contra flag), not one page of the list. */
export const fetchSimpleAccounts = async (): Promise<SimpleAccount[]> => {
  const { data } = await apiClient.get<unknown>(API_ACCOUNT.GET_SIMPLE_ACCOUNTS);
  return toSimpleAccounts(data);
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

export type DraftBalanceLog = BalanceLog & {
  id?: string;
  _id?: string;
  createdAt: string;
  performedBy?: { name?: string; email?: string };
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
