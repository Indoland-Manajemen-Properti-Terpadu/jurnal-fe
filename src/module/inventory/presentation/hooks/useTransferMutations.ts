import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TransferInput } from '@/module/inventory/domain/stockTransfer';
import {
  approveTransfer,
  createTransfer,
  rejectTransfer,
  voidTransfer,
} from '@/module/inventory/infrastructure/transferApi';
import {
  inventoryKeys,
  useInventoryScope,
} from '@/module/inventory/presentation/hooks/inventoryKeys';

/**
 * A transfer moves stock once it is approved or cancelled, so the balances, the history, the stock
 * cards and every warehouse's figures all refresh after any of the steps.
 */
export const useTransferMutations = () => {
  const queryClient = useQueryClient();
  const scope = useInventoryScope();
  const refresh = () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all(scope) });

  return {
    create: useMutation({
      mutationFn: (input: TransferInput) => createTransfer(input),
      onSuccess: refresh,
    }),
    approve: useMutation({
      mutationFn: ({ id }: { id: string }) => approveTransfer(id),
      onSuccess: refresh,
    }),
    reject: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectTransfer(id, reason),
      onSuccess: refresh,
    }),
    cancel: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => voidTransfer(id, reason),
      onSuccess: refresh,
    }),
  };
};
