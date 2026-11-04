import { useMutation } from '@tanstack/react-query';
import type { toAddPocketInput, toTransferInput } from '@/module/petty-cash/domain/pockets';
import {
  addPocket,
  transferBetweenPockets,
  updatePocket,
} from '@/module/petty-cash/infrastructure/pettyCashFundApi';
import { useIdempotentMutation } from '@/module/petty-cash/presentation/hooks/useIdempotentMutation';
import { usePettyCashNotifier } from '@/module/petty-cash/presentation/hooks/usePettyCashNotifier';
import { useRefreshPettyCash } from '@/module/petty-cash/presentation/hooks/useRefreshPettyCash';

const useOutcome = () => {
  const refresh = useRefreshPettyCash();
  const notify = usePettyCashNotifier();
  return {
    succeed: async (key: string, name: string) => {
      await refresh();
      notify.success(key, { name });
    },
    fail: async (error: unknown) => {
      notify.failure(error);
      await refresh();
    },
  };
};

export const useAddPocket = (fundId: string) => {
  const { succeed, fail } = useOutcome();
  return useMutation<void, unknown, ReturnType<typeof toAddPocketInput>>({
    mutationFn: (input) => addPocket(fundId, input),
    onSuccess: (_result, input) => succeed('pocketAdded', input.name),
    onError: fail,
  });
};

export const useUpdatePocket = (fundId: string, code: string, name: string) => {
  const { succeed, fail } = useOutcome();
  return useMutation<void, unknown, Record<string, unknown>>({
    mutationFn: (patch) => updatePocket(fundId, code, patch),
    onSuccess: () => succeed('pocketUpdated', name),
    onError: fail,
  });
};

export const usePocketTransfer = (fundId: string) => {
  const { succeed, fail } = useOutcome();
  return useIdempotentMutation<void, ReturnType<typeof toTransferInput>>(
    `fund:pocket-transfer:${fundId}`,
    (input, key) => transferBetweenPockets(fundId, input, key),
    { onSuccess: () => succeed('pocketTransferred', ''), onError: fail }
  );
};
