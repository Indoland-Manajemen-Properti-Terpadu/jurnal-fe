import { useMemo } from 'react';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  billVerifyItems,
  countDecisions,
  orderSendItems,
  orderFollowUpItems,
  paymentApprovalItems,
  paymentReleaseItems,
  requestItems,
  sortWorkItems,
  type WorkItem,
} from '@/module/purchases/domain/purchaseOverview';
import type { CanFn } from '@/module/purchases/presentation/components/hub/hubTabs';
import {
  useBills,
  useOrders,
  usePayablesAging,
  usePaymentRequests,
  usePayments,
  useRequests,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';

const LIMIT = 10;
const base = { limit: LIMIT, sortBy: 'createdAt', sortOrder: 'desc' as const };
const M = PURCHASE_MENU;

/**
 * Everything the overview needs. Each call asks for one status (the server takes one per call)
 * and only runs when the user holds the matching right, so a hidden tab costs no request.
 */
export const useOverviewData = (can: CanFn) => {
  const canDocs = can(M.documents, 'read');
  const requests = useRequests(
    { ...base, status: 'SUBMITTED' },
    can(M.requestVerify, 'read') && can(M.requestVerify, 'update')
  );
  const ordersDraft = useOrders(
    { ...base, status: 'DRAFT' },
    canDocs && can(M.documents, 'update')
  );
  const paymentsPending = usePaymentRequests(
    { ...base, status: 'PENDING_APPROVAL' },
    can(M.approvePayment, 'read')
  );
  const paymentsReady = usePayments({ ...base, status: 'DRAFT' }, can(M.payments, 'update'));
  const billsDraft = useBills({ ...base, status: 'DRAFT' }, canDocs && can(M.documents, 'update'));
  const ordersSent = useOrders({ ...base, status: 'SENT' }, canDocs);
  const ordersPartial = useOrders({ ...base, status: 'PARTIAL_RECEIVED' }, canDocs);
  const aging = usePayablesAging({}, can(M.reports, 'read'));

  const queries = [
    requests,
    ordersDraft,
    paymentsPending,
    paymentsReady,
    billsDraft,
    ordersSent,
    ordersPartial,
  ];

  const items = useMemo<WorkItem[]>(
    () =>
      sortWorkItems([
        ...requestItems(requests.data?.items ?? []),
        ...orderSendItems(ordersDraft.data?.items ?? []),
        ...paymentApprovalItems(paymentsPending.data?.items ?? []),
        ...paymentReleaseItems(paymentsReady.data?.items ?? []),
        ...billVerifyItems(billsDraft.data?.items ?? []),
        ...orderFollowUpItems([
          ...(ordersSent.data?.items ?? []),
          ...(ordersPartial.data?.items ?? []),
        ]),
      ]),
    [
      requests.data,
      ordersDraft.data,
      paymentsPending.data,
      paymentsReady.data,
      billsDraft.data,
      ordersSent.data,
      ordersPartial.data,
    ]
  );

  const totals = aging.data?.totals;
  return {
    items,
    totals: totals ?? null,
    decisions: countDecisions(items),
    readyToPay: paymentsReady.data?.totalResults ?? 0,
    showReadyToPay: can(M.payments, 'update'),
    isLoading: queries.some((query) => query.isLoading) || aging.isLoading,
    isError: queries.some((query) => query.isError) || aging.isError,
    refetch: () => {
      queries.forEach((query) => query.refetch());
      aging.refetch();
    },
  };
};

export type OverviewData = ReturnType<typeof useOverviewData>;
