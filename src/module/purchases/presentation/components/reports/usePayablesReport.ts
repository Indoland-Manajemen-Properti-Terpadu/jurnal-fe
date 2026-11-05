import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { normalizeAgingRow, type RawAgingRow } from '@/module/purchases/domain/payablesView';
import type { PayablesAging } from '@/module/purchases/domain/purchaseDocuments';
import type { ApiEnvelope } from '@/module/purchases/infrastructure/purchaseDto';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import type { PurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

interface RawAging {
  asOf: string;
  rows: RawAgingRow[];
  totals: PayablesAging['totals'];
}

export interface PayablesParams {
  asOf?: string;
  vendor?: string;
}

/**
 * The aging report with the vendor read from the shape the service really sends (`{ id, name }`);
 * the shared mapper expects a full contact and would show every vendor as a dash.
 */
export const usePayablesReport = (params: PayablesParams, enabled: boolean) => {
  const scope = usePurchaseScope();
  return useQuery<PayablesAging, PurchaseError>({
    queryKey: [...purchaseKeys.all(scope), 'aging-report', params],
    queryFn: async () => {
      const { data } = await http.get<ApiEnvelope<RawAging>>(PURCHASE_API.payablesBySupplier, {
        ...params,
      });
      return {
        asOf: data.asOf.slice(0, 10),
        rows: data.rows.map(normalizeAgingRow),
        totals: data.totals,
      };
    },
    enabled,
    placeholderData: keepPreviousData,
  });
};
