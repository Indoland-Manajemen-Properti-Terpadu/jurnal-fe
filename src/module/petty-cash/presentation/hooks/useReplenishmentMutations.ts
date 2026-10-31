import { formatCurrency } from '@/utils/formatCurrency';
import type { ReimbursementRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import type { ReplenishmentInput } from '@/module/petty-cash/domain/replenishment';
import {
  approveReplenishment,
  cancelReplenishment,
  createReplenishment,
  disburseReplenishment,
  rejectReplenishment,
} from '@/module/petty-cash/infrastructure/pettyCashReplenishmentApi';
import { useIdempotentMutation } from '@/module/petty-cash/presentation/hooks/useIdempotentMutation';
import { usePettyCashNotifier } from '@/module/petty-cash/presentation/hooks/usePettyCashNotifier';
import { useRefreshPettyCash } from '@/module/petty-cash/presentation/hooks/useRefreshPettyCash';

export const useCreateReplenishment = (fundId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<ReimbursementRecord, ReplenishmentInput>(
    `replenishment:create:${fundId}`,
    (input, key) => createReplenishment(input, key),
    {
      onSuccess: async (record) => {
        await refresh();
        notify.success('replenishmentCreated', { number: record.reimbursementNumber });
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};

export type ReplenishmentDecision = 'approve' | 'reject' | 'cancel' | 'disburse';

const NOTIFY: Record<ReplenishmentDecision, string> = {
  approve: 'replenishmentApproved',
  reject: 'replenishmentRejected',
  cancel: 'replenishmentCancelled',
  disburse: 'replenishmentDisbursed',
};

export interface ReplenishmentDecisionVariables {
  reason?: string;
  disbursementDate?: string;
}

/** Approve, reject, cancel or disburse one replenishment; the three that need it carry a reason or a date. */
export const useReplenishmentDecision = (id: string, decision: ReplenishmentDecision) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<ReimbursementRecord, ReplenishmentDecisionVariables>(
    `replenishment:${decision}:${id}`,
    ({ reason = '', disbursementDate = '' }, key) => {
      if (decision === 'approve') return approveReplenishment(id, key);
      if (decision === 'reject') return rejectReplenishment(id, reason, key);
      if (decision === 'cancel') return cancelReplenishment(id, reason, key);
      return disburseReplenishment(id, disbursementDate, key);
    },
    {
      onSuccess: async (record) => {
        await refresh();
        // The cash after a payout is only in the answer to the payout; without it, say nothing about cash.
        const hasCash = decision === 'disburse' && record.cashBalanceAfter !== null;
        notify.success(
          decision === 'disburse' && !hasCash ? 'replenishmentDisbursedNoCash' : NOTIFY[decision],
          {
            number: record.reimbursementNumber,
            cash: formatCurrency(record.cashBalanceAfter ?? 0, false),
          }
        );
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};
