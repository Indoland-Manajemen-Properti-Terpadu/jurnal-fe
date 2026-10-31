import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '@/module/settings/infrastructure/settingApi';
import type {
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
} from '@/module/settings/domain/settingTypes';

import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

import { useTranslation } from '@/i18n';

export const usePaymentMethods = () =>
  useQuery({
    queryKey: settingKeys.paymentMethods(),
    queryFn: () => fetchPaymentMethods(),
  });

export const useCreatePaymentMethod = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentMethodPayload) => createPaymentMethod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentMethods() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.paymentMethod.created'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.paymentMethod.createFailed'),
      });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentMethodPayload }) =>
      updatePaymentMethod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentMethods() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.paymentMethod.updated'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.paymentMethod.updateFailed'),
      });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentMethods() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.paymentMethod.deleted'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.paymentMethod.deleteFailed'),
      });
    },
  });
};
