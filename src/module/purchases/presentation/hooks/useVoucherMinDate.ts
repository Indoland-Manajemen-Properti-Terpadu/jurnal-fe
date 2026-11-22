import { useQueries } from '@tanstack/react-query';
import type { PaymentVoucher, PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { getBill } from '@/module/purchases/infrastructure/purchaseApi';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

/**
 * The server refuses to pay a voucher before the date of any bill it settles, so the pay dialog starts
 * at the latest of those dates. Empty while the bills load, or when the voucher pays only advances.
 */
export const useVoucherMinDate = (doc: PaymentVoucher): string => {
  const scope = usePurchaseScope();
  const billIds = [...new Set(doc.items.map((item) => item.billId).filter(Boolean))] as string[];
  const results = useQueries({
    queries: billIds.map((id) => ({
      queryKey: purchaseKeys.detail(scope, 'bills', id),
      queryFn: () => getBill(id),
    })),
  });
  return results
    .map((result) => (result.data as PurchaseBill | undefined)?.date ?? '')
    .reduce((latest, date) => (date > latest ? date : latest), '');
};
