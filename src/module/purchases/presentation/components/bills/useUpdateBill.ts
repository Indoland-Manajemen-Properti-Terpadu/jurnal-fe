import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BillUpdateInput } from '@/module/purchases/domain/billForm';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import type { ApiEnvelope, PurchaseBillDto } from '@/module/purchases/infrastructure/purchaseDto';
import { toPurchaseBill } from '@/module/purchases/infrastructure/purchaseDocumentMappers';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseNotifier } from '@/module/purchases/presentation/hooks/usePurchaseNotifier';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

/**
 * Saving a draft bill takes the create fields without the order, and no empty due date. The shared
 * update hook sends the create shape, which the service refuses, so the bill form uses this one.
 */
export const useUpdateBill = (onDone: (bill: PurchaseBill) => void) => {
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const notify = usePurchaseNotifier();
  const refresh = () => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) });
  return useMutation<PurchaseBill, unknown, { id: string; input: BillUpdateInput }>({
    mutationFn: async ({ id, input }) =>
      toPurchaseBill(
        (await http.put<ApiEnvelope<PurchaseBillDto>>(PURCHASE_API.bill(id), input)).data
      ),
    onSuccess: async (bill) => {
      await refresh();
      notify.success('updated', bill.number);
      onDone(bill);
    },
    onError: async (error) => {
      notify.failure(error);
      await refresh();
    },
  });
};
