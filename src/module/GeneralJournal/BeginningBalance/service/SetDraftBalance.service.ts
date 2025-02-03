import { routes } from '@/router';
import { get, post } from '@/services/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DraftAccount } from '../types/DraftAccount.types';
import { useDraftAccountStore } from '../store/useBeginingBalance';
import { GetJournalAccounts } from '../../JournalAccount/service/AccountJournal.service';

export const GetDraftAccount = () => {
  const { draftAccounts, setDraftAccounts } = useDraftAccountStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['draftAccounts'],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_DRAFT_BALANCE}`);
      return result;
    },
    meta: {
      onSuccess: (data: DraftAccount[]) => {
        setDraftAccounts(data);
      },
    },
  });

  return {
    draftAccounts: draftAccounts || data,
    isLoading,
    isError,
  };
};

export const useSetDraftBalance = () => {
  return useMutation({
    mutationFn: async (data: any) => post(API_ACCOUNT.POST_DRAFT_BALANCE, data),
    onSuccess: () => {
      GetJournalAccounts();
      notifications.show({
        color: 'cyan',
        autoClose: 3000,
        title: 'Draft has been saved!',
        message: `Your draft balance has been saved.`,
      });
    },
    onError: (error: Error) => {
      console.error('Error adding account:', error);
    },
  });
};

export const usePublishDraftBalance = () => {
  return useMutation({
    mutationFn: async (data: any) => post(`${API_ACCOUNT.POST_PUBLISH_DRAFT_BALANCE}`, data),
    onSuccess: () => {
      GetJournalAccounts();
      notifications.show({
        color: 'cyan',
        autoClose: 3000,
        title: 'Draft has been published!',
        message: `Your draft balance has been published.`,
      });
    },
    onError: (error: Error) => {
      console.error('Error adding account:', error);
    },
  });
};
