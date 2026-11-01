import type { CountRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import type { CountInput } from '@/module/petty-cash/domain/cashCount';
import {
  approveCount,
  createCount,
  rejectCount,
  submitCount,
} from '@/module/petty-cash/infrastructure/pettyCashCountApi';
import { useIdempotentMutation } from '@/module/petty-cash/presentation/hooks/useIdempotentMutation';
import { usePettyCashNotifier } from '@/module/petty-cash/presentation/hooks/usePettyCashNotifier';
import { useRefreshPettyCash } from '@/module/petty-cash/presentation/hooks/useRefreshPettyCash';

export interface CreateCountVariables {
  input: CountInput;
  submit: boolean;
}

export const useCreateCount = (fundId: string) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<CountRecord, CreateCountVariables>(
    `count:create:${fundId}`,
    (variables, key) => createCount({ fundId, ...variables }, key),
    {
      onSuccess: async (count, variables) => {
        await refresh();
        notify.success(variables.submit ? 'countSubmitted' : 'countCreated', {
          number: count.countNumber,
        });
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};

export type CountDecision = 'submit' | 'approve' | 'reject';

const COUNT_NOTIFY: Record<CountDecision, string> = {
  submit: 'countSubmitted',
  approve: 'countApproved',
  reject: 'countRejected',
};

/** Submit a draft count, or approve or reject a submitted one (reject carries a reason). */
export const useCountDecision = (countId: string, decision: CountDecision) => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return useIdempotentMutation<CountRecord, { reason?: string }>(
    `count:${decision}:${countId}`,
    ({ reason = '' }, key) => {
      if (decision === 'submit') return submitCount(countId, reason || null, key);
      return decision === 'approve'
        ? approveCount(countId, key)
        : rejectCount(countId, reason, key);
    },
    {
      onSuccess: async (count) => {
        await refresh();
        notify.success(COUNT_NOTIFY[decision], { number: count.countNumber });
      },
      onError: async (error) => {
        notify.failure(error);
        await refresh();
      },
    }
  );
};
