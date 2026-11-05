import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaymentUpdateInput } from '@/module/purchases/domain/paymentForm';
import type { PaymentVoucher } from '@/module/purchases/domain/purchaseDocuments';
import { toPaymentVoucher } from '@/module/purchases/infrastructure/purchaseDocumentMappers';
import type { ApiEnvelope, PaymentVoucherDto } from '@/module/purchases/infrastructure/purchaseDto';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseNotifier } from '@/module/purchases/presentation/hooks/usePurchaseNotifier';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

/**
 * Changing a voucher cannot restate its vendor or type (the service refuses both), so the form
 * saves through this call instead of the shared update hook, which sends the create shape.
 */
export const useUpdatePaymentVoucher = (onDone: (doc: PaymentVoucher) => void) => {
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const notify = usePurchaseNotifier();
  const refresh = () => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) });
  return useMutation<PaymentVoucher, unknown, { id: string; input: PaymentUpdateInput }>({
    mutationFn: async ({ id, input }) =>
      toPaymentVoucher(
        (await http.put<ApiEnvelope<PaymentVoucherDto>>(PURCHASE_API.payment(id), input)).data
      ),
    onSuccess: async (doc) => {
      await refresh();
      notify.success('updated', doc.number);
      onDone(doc);
    },
    onError: async (error) => {
      notify.failure(error);
      await refresh();
    },
  });
};
