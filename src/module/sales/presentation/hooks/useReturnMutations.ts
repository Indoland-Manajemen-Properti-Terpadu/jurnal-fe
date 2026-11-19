import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SaleReturn } from '../../domain/saleReturn';
import type { ReturnFormValues } from '../../domain/saleReturnForm';
import {
  applyReturnCredit,
  createReturn,
  deleteReturn,
  downloadReturnPdf,
  postReturn,
  refundReturn,
  updateReturn,
  voidReturn,
  voidReturnApplication,
  voidReturnRefund,
} from '../../infrastructure/saleReturnApi';
import type { ApplyCreditInput, RefundInput } from '../../infrastructure/saleReturnPayloads';
import { downloadBlob } from './downloadBlob';
import { useDocNotifier } from './useDocNotifier';
import { returnKeys } from './useReturnQueries';
import { saleKeys } from './useSaleQueries';

/**
 * Every return mutation refreshes the return queries and the sales ones (a return changes the
 * invoice and its balance), whether it worked or not. Nothing is optimistic; a pending mutation
 * blocks a second submit.
 */
const useRefreshReturns = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: returnKeys.all }),
      queryClient.invalidateQueries({ queryKey: saleKeys.all }),
    ]);
};

export const useCreateReturn = () => {
  const notify = useDocNotifier('salesReturns');
  const refresh = useRefreshReturns();
  return useMutation({
    mutationFn: (values: ReturnFormValues) => createReturn(values),
    onSuccess: (ret) => notify.success('created', ret.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useUpdateReturn = (id: string) => {
  const notify = useDocNotifier('salesReturns');
  const refresh = useRefreshReturns();
  return useMutation({
    mutationFn: (values: ReturnFormValues) => updateReturn(id, values),
    onSuccess: (ret) => notify.success('updated', ret.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

/** The simple state changes that take only the return's id. */
const useReturnTransition = (run: (id: string) => Promise<SaleReturn>, successKey: string) => {
  const notify = useDocNotifier('salesReturns');
  const refresh = useRefreshReturns();
  return useMutation({
    mutationFn: (id: string) => run(id),
    onSuccess: (ret) => notify.success(successKey, ret.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useIssueReturn = () => useReturnTransition(postReturn, 'issued');
export const useCancelReturnRefund = () => useReturnTransition(voidReturnRefund, 'refundCancelled');

export const useCancelReturn = () => {
  const notify = useDocNotifier('salesReturns');
  const refresh = useRefreshReturns();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => voidReturn(id, reason),
    onSuccess: (ret) => notify.success('cancelled', ret.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useApplyReturnCredit = () => {
  const notify = useDocNotifier('salesReturns');
  const refresh = useRefreshReturns();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApplyCreditInput }) =>
      applyReturnCredit(id, input),
    onSuccess: (ret) => notify.success('creditApplied', ret.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useCancelReturnApplication = () => {
  const notify = useDocNotifier('salesReturns');
  const refresh = useRefreshReturns();
  return useMutation({
    mutationFn: ({ id, applicationId }: { id: string; applicationId: string }) =>
      voidReturnApplication(id, applicationId),
    onSuccess: (ret) => notify.success('applicationCancelled', ret.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useRefundReturn = () => {
  const notify = useDocNotifier('salesReturns');
  const refresh = useRefreshReturns();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RefundInput }) => refundReturn(id, input),
    onSuccess: (ret) => notify.success('refunded', ret.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useDeleteReturn = () => {
  const notify = useDocNotifier('salesReturns');
  const refresh = useRefreshReturns();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReturn(id),
    onSuccess: (_, id) => {
      // A page still open on the deleted draft must not fetch it again.
      queryClient.removeQueries({ queryKey: returnKeys.detail(id) });
      notify.success('deleted');
    },
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useDownloadReturnPdf = () => {
  const notify = useDocNotifier('salesReturns');
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) =>
      downloadBlob(await downloadReturnPdf(id), filename),
    onError: notify.failure,
  });
};
