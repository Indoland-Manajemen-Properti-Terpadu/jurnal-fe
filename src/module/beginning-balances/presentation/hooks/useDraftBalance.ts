import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { t } from '@/i18n';
import {
  fetchDraftBalance,
  errorMessage,
  fetchDraftBalanceLogs,
  publishBalance,
  saveDraftBalance,
} from '../../infrastructure/draftBalanceApi';

const tr = (key: string, params?: Record<string, string | number>) =>
  t(key, params, 'beginningBalances');

export const useDraftAccount = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['draftAccounts'],
    queryFn: fetchDraftBalance,
  });

  return { draftAccounts: data, isLoading, isError, refetch };
};

export const useDraftBalanceLogs = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['draftBalanceLogs'],
    queryFn: fetchDraftBalanceLogs,
    enabled,
  });

export const useSetDraftBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveDraftBalance,
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        autoClose: 3500,
        title: tr('toast.draftSavedTitle'),
        message: tr('toast.draftSavedMessage'),
      });
      queryClient.invalidateQueries({ queryKey: ['draftAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['draftBalanceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        autoClose: 4000,
        title: tr('toast.draftFailedTitle'),
        message: errorMessage(error, tr('toast.draftFailedMessage')),
      });
    },
  });
};

export const usePublishDraftBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishBalance,
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        autoClose: 4000,
        title: tr('toast.publishedTitle'),
        message: tr('toast.publishedMessage'),
      });
      queryClient.invalidateQueries({ queryKey: ['draftAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['draftBalanceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['journalAccounts'] });
    },
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        autoClose: 4000,
        title: tr('toast.publishFailedTitle'),
        message: errorMessage(error, tr('toast.publishFailedMessage')),
      });
    },
  });
};
