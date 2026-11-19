import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  createPaymentTerm,
  deletePaymentTerm,
  fetchPaymentTerm,
  fetchPaymentTerms,
  isPaymentTermInUseError,
  readPaymentTermError,
  setPaymentTermStatus,
  updatePaymentTerm,
  type PaymentTermListParams,
} from '@/module/settings/infrastructure/paymentTermApi';
import type { PaymentTermPayload } from '@/module/settings/domain/paymentTerm';
import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';
import { useTranslation } from '@/i18n';

/** Statuses where the API explains what is wrong with what the person entered. */
const READABLE_FAILURE_STATUSES = [400, 409, 422];

/** The API's own words for a rejected entry (a duplicate name, for example); a plain message otherwise. */
const failureMessage = (error: unknown, fallback: string): string => {
  const { status, message } = readPaymentTermError(error);
  return status && READABLE_FAILURE_STATUSES.includes(status) && message ? message : fallback;
};

export const usePaymentTermList = (params: PaymentTermListParams = {}) =>
  useQuery({
    queryKey: settingKeys.paymentTermList(params),
    queryFn: () => fetchPaymentTerms(params),
    placeholderData: keepPreviousData,
  });

export const usePaymentTermDetail = (id: string | undefined) =>
  useQuery({
    queryKey: settingKeys.paymentTermDetail(id ?? ''),
    queryFn: () => fetchPaymentTerm(id as string),
    enabled: Boolean(id),
  });

const useRefreshAndNotify = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return {
    succeed: (message: string) => {
      queryClient.invalidateQueries({ queryKey: settingKeys.paymentTerms() });
      notifications.show({ color: 'teal', title: st('notify.success'), message });
    },
    fail: (message: string) =>
      notifications.show({ color: 'red', title: st('notify.failure'), message }),
    st,
  };
};

export const useCreatePaymentTerm = () => {
  const { succeed, fail, st } = useRefreshAndNotify();
  return useMutation({
    mutationFn: (payload: PaymentTermPayload) => createPaymentTerm(payload),
    onSuccess: () => succeed(st('notify.paymentTerm.created')),
    onError: (error) => fail(failureMessage(error, st('notify.paymentTerm.createFailed'))),
  });
};

export const useUpdatePaymentTerm = () => {
  const { succeed, fail, st } = useRefreshAndNotify();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PaymentTermPayload }) =>
      updatePaymentTerm(id, payload),
    onSuccess: () => succeed(st('notify.paymentTerm.updated')),
    onError: (error) => fail(failureMessage(error, st('notify.paymentTerm.updateFailed'))),
  });
};

export const useSetPaymentTermStatus = () => {
  const { succeed, fail, st } = useRefreshAndNotify();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setPaymentTermStatus(id, isActive),
    onSuccess: (_term, { isActive }) =>
      succeed(st(isActive ? 'notify.paymentTerm.activated' : 'notify.paymentTerm.deactivated')),
    onError: () => fail(st('notify.paymentTerm.statusFailed')),
  });
};

/** A 409 (term in use) shows no message here: the page offers to deactivate the term instead. */
export const useDeletePaymentTerm = () => {
  const { succeed, fail, st } = useRefreshAndNotify();
  return useMutation({
    mutationFn: (id: string) => deletePaymentTerm(id),
    onSuccess: () => succeed(st('notify.paymentTerm.deleted')),
    onError: (error) => {
      if (!isPaymentTermInUseError(error)) {
        fail(st('notify.paymentTerm.deleteFailed'));
      }
    },
  });
};
