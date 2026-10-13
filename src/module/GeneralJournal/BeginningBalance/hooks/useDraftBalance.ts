import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DraftAccount } from '../types/DraftAccount.types';
import { useDraftAccountStore } from '../store/useBeginingBalance';
import {
  getDraftAccount,
  postDraftBalance,
  postPublishDraftBalance,
} from '../services/SetDraftBalance.service';

export const useDraftAccount = () => {
  const { draftAccounts, setDraftAccounts } = useDraftAccountStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['draftAccounts'],
    queryFn: getDraftAccount,
    meta: {
      onSuccess: (queryData: DraftAccount[]) => {
        setDraftAccounts(queryData);
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
    mutationFn: postDraftBalance,
    onSuccess: () => {
      notifications.show({
        color: 'green',
        autoClose: 3000,
        title: 'Draft has been saved!',
        message: 'Your draft balance has been saved.',
      });
    },
    onError: (error: Error) => {
      console.error('Error adding account:', error);
    },
  });
};

export const usePublishDraftBalance = () => {
  return useMutation({
    mutationFn: postPublishDraftBalance,
    onSuccess: () => {
      notifications.show({
        color: 'green',
        autoClose: 3000,
        title: 'Draft has been published!',
        message: 'Your draft balance has been published.',
      });
    },
    onError: (error: Error) => {
      console.error('Error adding account:', error);
    },
  });
};
