import { useQuery } from '@tanstack/react-query';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import type { ApiEnvelope } from '@/module/purchases/infrastructure/purchaseDto';
import type { PurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import { toDate } from '@/module/purchases/infrastructure/purchaseMappers';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

/**
 * Two parts of a bill the shared bill mapper does not carry: what the three-way match found (with
 * the expected and actual figures) and the credit allocations (with their date and whether they
 * were cancelled). Read from the same bill, refreshed together with every purchasing query.
 */
interface BillExtrasDto {
  variances?: {
    type: 'PRICE' | 'TOTAL';
    purchaseOrderItem?: string;
    expected: number;
    actual: number;
  }[];
  creditApplications?: {
    _id: string;
    source: 'ADVANCE' | 'RETURN';
    sourceId: string;
    amount: number;
    appliedAt: string;
    voided?: boolean;
  }[];
}

export interface BillVarianceFinding {
  type: 'PRICE' | 'TOTAL';
  /** Order line the price difference belongs to. */
  purchaseOrderItemId: string | null;
  expected: number;
  actual: number;
}

export interface BillCreditAllocation {
  id: string;
  source: 'ADVANCE' | 'RETURN';
  sourceId: string;
  amount: number;
  date: string;
  voided: boolean;
}

export interface BillExtras {
  variances: BillVarianceFinding[];
  allocations: BillCreditAllocation[];
}

export const toBillExtras = (dto: BillExtrasDto): BillExtras => ({
  variances: (dto.variances ?? []).map((variance) => ({
    type: variance.type,
    purchaseOrderItemId: variance.purchaseOrderItem ?? null,
    expected: variance.expected,
    actual: variance.actual,
  })),
  allocations: (dto.creditApplications ?? []).map((application) => ({
    id: application._id,
    source: application.source,
    sourceId: application.sourceId,
    amount: application.amount,
    date: toDate(application.appliedAt),
    voided: Boolean(application.voided),
  })),
});

export const useBillExtras = (billId: string | undefined) => {
  const scope = usePurchaseScope();
  return useQuery<BillExtras, PurchaseError>({
    queryKey: [...purchaseKeys.detail(scope, 'bills', billId ?? ''), 'extras'],
    queryFn: async () =>
      toBillExtras(
        (await http.get<ApiEnvelope<BillExtrasDto>>(PURCHASE_API.bill(billId as string))).data
      ),
    enabled: Boolean(billId),
  });
};
