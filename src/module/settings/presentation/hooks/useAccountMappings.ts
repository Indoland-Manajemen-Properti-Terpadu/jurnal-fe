import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchAccountMappings,
  seedAccountMappings,
  updateAccountMapping,
  updateAccountMappingBatch,
} from '@/module/settings/infrastructure/settingApi';

import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

import { useTranslation } from '@/i18n';

export const useAccountMappings = () =>
  useQuery({
    queryKey: settingKeys.accountMappings(),
    queryFn: fetchAccountMappings,
  });

export const useSeedAccountMappings = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seedAccountMappings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.accountMappings() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.mapping.seeded'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.mapping.seedFailed'),
      });
    },
  });
};

export const useUpdateAccountMapping = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId: string }) =>
      updateAccountMapping(id, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.accountMappings() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.mapping.updated'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.mapping.updateFailed'),
      });
    },
  });
};

export const useUpdateAccountMappingBatch = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mappings: Array<{ id: string; account: string }>) =>
      updateAccountMappingBatch(mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.accountMappings() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.mapping.batchSaved'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.mapping.batchFailed'),
      });
    },
  });
};
