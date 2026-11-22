import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TransferInput } from '@/module/inventory/domain/stockTransfer';
import { createTransfer, voidTransfer } from '@/module/inventory/infrastructure/transferApi';
import {
  inventoryKeys,
  useInventoryScope,
} from '@/module/inventory/presentation/hooks/inventoryKeys';

/**
 * A transfer moves stock, so the balances, the history, the stock cards and every warehouse's
 * figures all refresh after it is saved or cancelled.
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
    cancel: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => voidTransfer(id, reason),
      onSuccess: refresh,
    }),
  };
};
