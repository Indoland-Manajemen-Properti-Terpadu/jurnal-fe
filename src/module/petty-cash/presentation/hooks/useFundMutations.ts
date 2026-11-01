import { useMutation } from '@tanstack/react-query';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import type { toCreateFundInput, toPaguInput } from '@/module/petty-cash/domain/fundAdmin';
import {
  adjustPagu,
  closeFund,
  createFund,
  updateFund,
} from '@/module/petty-cash/infrastructure/pettyCashFundApi';
import { useIdempotentMutation } from '@/module/petty-cash/presentation/hooks/useIdempotentMutation';
import { usePettyCashNotifier } from '@/module/petty-cash/presentation/hooks/usePettyCashNotifier';
import { useRefreshPettyCash } from '@/module/petty-cash/presentation/hooks/useRefreshPettyCash';

const useOutcome = () => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return {
    succeed: async (key: string, fund: PettyCashFund) => {
      await refresh();
      notify.success(key, { name: fund.name });
    },
    fail: async (error: unknown) => {
      notify.failure(error);
      await refresh();
    },
  };
};

export const useCreateFund = () => {
  const { succeed, fail } = useOutcome();
  return useIdempotentMutation<PettyCashFund, ReturnType<typeof toCreateFundInput>>(
    'fund:create',
    (input, key) => createFund(input, key),
    { onSuccess: (fund) => succeed('fundCreated', fund), onError: fail }
  );
};

export const useUpdateFund = (fundId: string) => {
  const { succeed, fail } = useOutcome();
  return useMutation<PettyCashFund, unknown, Record<string, unknown>>({
    mutationFn: (patch) => updateFund(fundId, patch),
    onSuccess: (fund) => succeed('fundUpdated', fund),
    onError: fail,
  });
};

export const useAdjustPagu = (fundId: string) => {
  const { succeed, fail } = useOutcome();
  return useIdempotentMutation<PettyCashFund, ReturnType<typeof toPaguInput>>(
    `fund:pagu:${fundId}`,
    (input, key) => adjustPagu(fundId, input, key),
    { onSuccess: (fund) => succeed('paguAdjusted', fund), onError: fail }
  );
};

export const useCloseFund = (fundId: string) => {
  const { succeed, fail } = useOutcome();
  return useIdempotentMutation<
    PettyCashFund,
    { bankAccountId: string; date: string; reason: string }
  >(`fund:close:${fundId}`, (input, key) => closeFund(fundId, input, key), {
    onSuccess: (fund) => succeed('fundClosed', fund),
    onError: fail,
  });
};
