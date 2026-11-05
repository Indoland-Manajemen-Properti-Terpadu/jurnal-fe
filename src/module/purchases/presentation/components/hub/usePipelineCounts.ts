import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import type { CanFn, HubTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import {
  useBills,
  useOrders,
  usePayments,
  useReceipts,
  useRequests,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';

export type PipelineStage = Extract<
  HubTab,
  'requests' | 'orders' | 'receipts' | 'bills' | 'payments'
>;

export interface StageCount {
  stage: PipelineStage;
  /** All documents of the stage; null while loading or when the user may not read it. */
  total: number | null;
}

const ONE = { limit: 1, page: 1 };
const M = PURCHASE_MENU;

/** Document totals per step of the buying chain; one single-row request per step. */
export const usePipelineCounts = (can: CanFn): StageCount[] => {
  const docs = can(M.documents, 'read');
  const requests = useRequests(ONE, docs);
  const orders = useOrders(ONE, docs);
  const receipts = useReceipts(ONE, docs);
  const bills = useBills(ONE, docs);
  const payments = usePayments(ONE, can(M.payments, 'read'));

  return [
    { stage: 'requests', total: requests.data?.totalResults ?? null },
    { stage: 'orders', total: orders.data?.totalResults ?? null },
    { stage: 'receipts', total: receipts.data?.totalResults ?? null },
    { stage: 'bills', total: bills.data?.totalResults ?? null },
    { stage: 'payments', total: payments.data?.totalResults ?? null },
  ];
};
