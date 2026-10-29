import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import {
  approveAllPendingChanges,
  approvePendingChange,
  fetchPendingChanges,
  fetchPendingChangesCount,
  getApiErrorMessage,
} from '../../infrastructure/pendingChangesApi';
import type { PendingChangeListParams } from '../../domain/pendingChange';

const NAMESPACE = 'pendingChanges';

export const pendingChangesKeys = {
  all: ['pending-changes'] as const,
  lists: () => [...pendingChangesKeys.all, 'list'] as const,
  list: (params?: PendingChangeListParams) => [...pendingChangesKeys.lists(), params] as const,
  count: () => [...pendingChangesKeys.all, 'count'] as const,
};

export const usePendingChanges = (params?: PendingChangeListParams) =>
  useQuery({
    queryKey: pendingChangesKeys.list(params),
    queryFn: () => fetchPendingChanges(params),
  });

export const usePendingChangesCount = () =>
  useQuery({
    queryKey: pendingChangesKeys.count(),
    queryFn: fetchPendingChangesCount,
    refetchInterval: 30_000, // Background poll every 30s
  });

export const useApprovePendingChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changeId: string) => approvePendingChange(changeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendingChangesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notifications.show({
        color: 'teal',
        title: t('approvedTitle', undefined, NAMESPACE),
        message: t('approvedMessage', undefined, NAMESPACE),
      });
    },
    onError: (err: unknown) => {
      notifications.show({
        color: 'red',
        title: t('approveFailedTitle', undefined, NAMESPACE),
        message: getApiErrorMessage(err) || t('approveFailedMessage', undefined, NAMESPACE),
      });
    },
  });
};

export const useApproveAllPendingChanges = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type?: string) => approveAllPendingChanges(type),
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: pendingChangesKeys.all });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notifications.show({
        color: 'teal',
        title: t('approvedAllTitle', undefined, NAMESPACE),
        message: type
          ? t('approvedAllTypeMessage', { type }, NAMESPACE)
          : t('approvedAllMessage', undefined, NAMESPACE),
      });
    },
    onError: (err: unknown) => {
      notifications.show({
        color: 'red',
        title: t('approveAllFailedTitle', undefined, NAMESPACE),
        message: getApiErrorMessage(err) || t('approveAllFailedMessage', undefined, NAMESPACE),
      });
    },
  });
};
