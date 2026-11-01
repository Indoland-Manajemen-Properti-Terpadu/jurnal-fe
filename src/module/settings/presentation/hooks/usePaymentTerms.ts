import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchPaymentTerms,
  createPaymentTerm,
  updatePaymentTerm,
  deletePaymentTerm,
} from '@/module/settings/infrastructure/settingApi';
import type {
  CreatePaymentTermPayload,
  UpdatePaymentTermPayload,
} from '@/module/settings/domain/settingTypes';

import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

import { useTranslation } from '@/i18n';

export const usePaymentTerms = () =>
  useQuery({
    queryKey: settingKeys.paymentTerms(),
    queryFn: () => fetchPaymentTerms(),
  });

export const useCreatePaymentTerm = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentTermPayload) => createPaymentTerm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentTerms() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.paymentTerm.created'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.paymentTerm.createFailed'),
      });
    },
  });
};

export const useUpdatePaymentTerm = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentTermPayload }) =>
      updatePaymentTerm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentTerms() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.paymentTerm.updated'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.paymentTerm.updateFailed'),
      });
    },
  });
};

export const useDeletePaymentTerm = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePaymentTerm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentTerms() });
      notifications.show({
        color: 'teal',
        title: st('notify.success'),
        message: st('notify.paymentTerm.deleted'),
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: st('notify.failure'),
        message: st('notify.paymentTerm.deleteFailed'),
      });
    },
  });
};
