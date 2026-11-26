import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  RetentionPreview,
  RetentionReleaseInput,
  RetentionReport,
  RetentionTask,
} from '@/module/purchases/domain/retention';
import type { PurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import {
  getRetentionReport,
  previewRetentionRelease,
  releaseRetention,
  getRetentionTasks,
} from '@/module/purchases/infrastructure/retentionApi';
import { usePurchaseNotifier } from '@/module/purchases/presentation/hooks/usePurchaseNotifier';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

export const useRetentionReport = (enabled = true) => {
  const scope = usePurchaseScope();
  return useQuery<RetentionReport, PurchaseError>({
    queryKey: purchaseKeys.retention(scope, 'report'),
    queryFn: getRetentionReport,
    enabled,
  });
};

export const useRetentionTasks = (enabled = true) => {
  const scope = usePurchaseScope();
  return useQuery<RetentionTask[], PurchaseError>({
    queryKey: purchaseKeys.retention(scope, 'tasks'),
    queryFn: getRetentionTasks,
    enabled,
  });
};

export const useRetentionPreview = (purchaseOrderId: string | null) => {
  const scope = usePurchaseScope();
  return useQuery<RetentionPreview, PurchaseError>({
    queryKey: [...purchaseKeys.retention(scope, 'report'), 'preview', purchaseOrderId],
    queryFn: () => previewRetentionRelease(purchaseOrderId ?? ''),
    enabled: Boolean(purchaseOrderId),
  });
};

/** A release makes a bill and moves the order out of maintenance, so every purchasing query refreshes. */
export const useReleaseRetention = (onDone?: (bill: { id: string; number: string }) => void) => {
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const notify = usePurchaseNotifier();
  const refresh = () => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) });
  return useMutation<{ id: string; number: string }, unknown, RetentionReleaseInput>({
    mutationFn: releaseRetention,
    onSuccess: async (bill) => {
      await refresh();
      notify.success('retentionReleased', bill.number);
      onDone?.(bill);
    },
    onError: async (error) => {
      notify.failure(error);
      await refresh();
    },
  });
};
