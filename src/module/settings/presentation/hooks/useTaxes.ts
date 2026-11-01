import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchTaxes,
  createTax,
  updateTax,
  deleteTax,
} from '@/module/settings/infrastructure/settingApi';
import type { CreateTaxPayload, UpdateTaxPayload } from '@/module/settings/domain/settingTypes';

import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

import { useTranslation } from '@/i18n';

export const useTaxes = () =>
  useQuery({
    queryKey: settingKeys.taxes(),
    queryFn: fetchTaxes,
  });

export const useCreateTax = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaxPayload) => createTax(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.taxes() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.tax.created'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.tax.createFailed'),
      });
    },
  });
};

export const useUpdateTax = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaxPayload }) =>
      updateTax(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.taxes() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.tax.updated'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.tax.updateFailed'),
      });
    },
  });
};

export const useDeleteTax = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.taxes() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.tax.deleted'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.tax.deleteFailed'),
      });
    },
  });
};
