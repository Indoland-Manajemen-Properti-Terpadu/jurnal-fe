import { API_ACCOUNT } from '@/services/endpoint';
import { get } from '@/services/apiClient';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';

export const getJournalAccounts = async (
  params?: Record<string, any>
): Promise<JournalAccounts[]> => {
  const result = await get(API_ACCOUNT.GET_ALL_ACCOUNT, params);
  return result.results;
};
