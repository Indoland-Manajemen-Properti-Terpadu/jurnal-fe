import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import type { OrderUpdateInput } from '@/module/purchases/domain/orderForm';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import type { ApiEnvelope, PurchaseOrderDto } from '@/module/purchases/infrastructure/purchaseDto';
import { toPurchaseOrder } from '@/module/purchases/infrastructure/purchaseDocumentMappers';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseNotifier } from '@/module/purchases/presentation/hooks/usePurchaseNotifier';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

/**
 * Saving an order takes the same fields as creating it, minus the request, and every line states
 * its quantity. The shared update hook sends the create shape, which the service refuses, so the
 * order form uses this one.
 */
export const useUpdateOrder = (onDone: (order: PurchaseOrder) => void) => {
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const notify = usePurchaseNotifier();
  const refresh = () => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) });
  return useMutation<PurchaseOrder, unknown, { id: string; input: OrderUpdateInput }>({
    mutationFn: async ({ id, input }) =>
      toPurchaseOrder(
        (await http.put<ApiEnvelope<PurchaseOrderDto>>(PURCHASE_API.order(id), input)).data
      ),
    onSuccess: async (order) => {
      await refresh();
      notify.success('updated', order.number);
      onDone(order);
    },
    onError: async (error) => {
      notify.failure(error);
      await refresh();
    },
  });
};
