import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchNumberFormats,
  createNumberFormat,
  updateNumberFormat,
  deleteNumberFormat,
} from '@/module/settings/infrastructure/settingApi';
import type {
  CreateNumberFormatPayload,
  UpdateNumberFormatPayload,
} from '@/module/settings/domain/settingTypes';

import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

import { useTranslation } from '@/i18n';

export const useNumberFormats = () =>
  useQuery({
    queryKey: settingKeys.numberFormats(),
    queryFn: fetchNumberFormats,
  });

export const useCreateNumberFormat = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNumberFormatPayload) => createNumberFormat(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.numberFormats() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.numberFormat.created'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.numberFormat.createFailed'),
      });
    },
  });
};

export const useUpdateNumberFormat = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNumberFormatPayload }) =>
      updateNumberFormat(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.numberFormats() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.numberFormat.updated'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.numberFormat.updateFailed'),
      });
    },
  });
};

export const useDeleteNumberFormat = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNumberFormat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.numberFormats() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.numberFormat.deleted'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.numberFormat.deleteFailed'),
      });
    },
  });
};
