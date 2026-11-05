import { useMemo } from 'react';
import { routes } from '@/router/routes';
import type { PurchaseStatus } from '@/module/purchases/domain/purchaseStatus';
import type { JourneyStep } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import {
  useBills,
  useOrder,
  usePayments,
  useReceipts,
  useRequest,
  useReturns,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';

const LIMIT = 50;

const detailPath = (pattern: string, id: string) => pattern.replace(':id', id);

interface JourneyAnchor {
  requestId?: string;
  orderId?: string;
  billId?: string;
  /** The document on screen, highlighted in the chain. */
  current?: JourneyStep['kind'];
}

/**
 * The chain a document belongs to, assembled from whichever end the page knows: a request leads
 * to its order, an order to its receipts and bills, a bill to its payments and returns.
 */
export const usePurchaseJourney = ({ requestId, orderId, billId, current }: JourneyAnchor) => {
  const request = useRequest(requestId);
  const resolvedOrderId = orderId ?? request.data?.purchaseOrderId ?? undefined;
  const order = useOrder(resolvedOrderId);
  const resolvedRequestId = requestId ?? order.data?.purchaseRequestId;
  const requestDoc = useRequest(requestId ? undefined : resolvedRequestId);
  const receipts = useReceipts(
    { purchaseOrder: resolvedOrderId, limit: LIMIT },
    Boolean(resolvedOrderId)
  );
  const bills = useBills(
    { purchaseOrder: resolvedOrderId, limit: LIMIT },
    Boolean(resolvedOrderId)
  );
  const payments = usePayments({ bill: billId, limit: LIMIT }, Boolean(billId));
  const returns = useReturns({ bill: billId, limit: LIMIT }, Boolean(billId));

  const requestData = request.data ?? requestDoc.data;

  const steps = useMemo<JourneyStep[]>(() => {
    const doc = <S extends PurchaseStatus>(id: string, number: string, status: S, to: string) => ({
      id,
      number,
      status,
      to,
    });
    const result: JourneyStep[] = [
      {
        kind: 'request',
        current: current === 'request',
        documents: requestData
          ? [
              doc(
                requestData.id,
                requestData.number,
                requestData.status,
                detailPath(routes.purchases.requestDetail, requestData.id)
              ),
            ]
          : [],
      },
      {
        kind: 'order',
        current: current === 'order',
        documents: order.data
          ? [
              doc(
                order.data.id,
                order.data.number,
                order.data.status,
                detailPath(routes.purchases.orderDetail, order.data.id)
              ),
            ]
          : [],
      },
      {
        kind: 'receipt',
        current: current === 'receipt',
        documents: (receipts.data?.items ?? []).map((item) =>
          doc(
            item.id,
            item.number,
            item.status,
            detailPath(routes.purchases.receiptDetail, item.id)
          )
        ),
      },
      {
        kind: 'bill',
        current: current === 'bill',
        documents: (bills.data?.items ?? []).map((item) =>
          doc(item.id, item.number, item.status, detailPath(routes.purchases.billDetail, item.id))
        ),
      },
      {
        kind: 'payment',
        current: current === 'payment',
        documents: (payments.data?.items ?? []).map((item) =>
          doc(
            item.id,
            item.number,
            item.status,
            detailPath(routes.purchases.paymentDetail, item.id)
          )
        ),
      },
    ];
    if (billId) {
      result.push({
        kind: 'return',
        current: current === 'return',
        documents: (returns.data?.items ?? []).map((item) =>
          doc(item.id, item.number, item.status, detailPath(routes.purchases.returnDetail, item.id))
        ),
      });
    }
    return result;
  }, [
    requestData,
    order.data,
    receipts.data,
    bills.data,
    payments.data,
    returns.data,
    billId,
    current,
  ]);

  return {
    steps,
    isLoading: request.isLoading || order.isLoading || receipts.isLoading || bills.isLoading,
  };
};
