import { API_ACCOUNT } from '@/lib/http/endpoints';
import apiClient from '@/lib/http/apiClient';
import { JournalAccounts } from '@/module/chart-of-accounts/domain/journalAccount';
import type { AddAccountPayload } from '../domain/addAccountPayload';

type JournalAccountsResponse = {
  results: JournalAccounts[];
};

type JournalAccountsQueryParams = {
  showArchived?: 1;
};

export const getJournalAccounts = async (
  params?: JournalAccountsQueryParams
): Promise<JournalAccounts[]> => {
  const response = await apiClient.get<JournalAccountsResponse>(API_ACCOUNT.GET_ALL_ACCOUNT, {
    params,
  });
  const accounts = response.data?.results;

  if (!Array.isArray(accounts)) {
    throw new Error('Invalid journal accounts response.');
  }

  return accounts;
};

/** Create, update and delete use the default client, so an HTTP error rejects (R3). */
export const createAccount = async (payload: AddAccountPayload): Promise<unknown> => {
  const response = await apiClient.post(API_ACCOUNT.ADD_ACCOUNT, payload);
  return response.data;
};

export const updateAccount = async (
  accountId: string,
  payload: AddAccountPayload
): Promise<unknown> => {
  const response = await apiClient.patch(`${API_ACCOUNT.ADD_ACCOUNT}/${accountId}`, payload);
  return response.data;
};

export const deleteAccounts = async (ids: { accountIds: string[] }): Promise<unknown> => {
  const response = await apiClient.delete(API_ACCOUNT.DELETE_ACCOUNT, { data: ids });
  return response.data;
};
