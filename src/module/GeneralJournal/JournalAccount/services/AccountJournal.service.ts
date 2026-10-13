import { API_ACCOUNT } from '@/services/endpoint';
import apiClient from '@/services/apiClient';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';

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
