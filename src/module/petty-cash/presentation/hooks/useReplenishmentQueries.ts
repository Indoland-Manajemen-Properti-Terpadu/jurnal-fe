import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  Page,
  ReimbursementRecord,
  ReplenishmentPreview,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type { ReplenishmentPreviewInput } from '@/module/petty-cash/domain/replenishment';
import type { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import {
  getReimbursement,
  listReimbursements,
  previewReplenishment,
  type ReimbursementListParams,
} from '@/module/petty-cash/infrastructure/pettyCashReplenishmentApi';
import { pettyCashKeys } from '@/module/petty-cash/presentation/hooks/pettyCashKeys';
import { usePettyCashScope } from '@/module/petty-cash/presentation/hooks/usePettyCashScope';

export const useReimbursements = (params: ReimbursementListParams = {}) => {
  const scope = usePettyCashScope();
  return useQuery<Page<ReimbursementRecord>, PettyCashError>({
    queryKey: pettyCashKeys.reimbursementList(scope, params),
    queryFn: () => listReimbursements(params),
    placeholderData: keepPreviousData,
  });
};

export const useReimbursement = (reimbursementId: string | undefined) => {
  const scope = usePettyCashScope();
  return useQuery<ReimbursementRecord, PettyCashError>({
    queryKey: pettyCashKeys.reimbursement(scope, reimbursementId ?? ''),
    queryFn: () => getReimbursement(reimbursementId as string),
    enabled: Boolean(reimbursementId),
    retry: (count, error) => error.code !== 'NOT_FOUND' && count < 2,
  });
};

/**
 * What the replenishment would pay and post. A POST that saves nothing, so it is safe to repeat;
 * it runs again whenever the selection, the bank or the date changes and is never cached for long.
 */
export const useReplenishmentPreview = (
  input: ReplenishmentPreviewInput | null,
  disbursementDate: string
) => {
  const scope = usePettyCashScope();
  return useQuery<ReplenishmentPreview, PettyCashError>({
    queryKey: pettyCashKeys.replenishmentPreview(
      scope,
      input ?? { fundId: '', voucherIds: [], bankAccountId: '' },
      disbursementDate
    ),
    queryFn: () =>
      previewReplenishment({ ...(input as ReplenishmentPreviewInput), disbursementDate }),
    enabled: input !== null,
    retry: false,
    gcTime: 30_000,
  });
};
