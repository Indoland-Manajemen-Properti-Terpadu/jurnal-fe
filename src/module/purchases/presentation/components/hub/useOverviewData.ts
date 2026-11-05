import { useMemo } from 'react';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  billVerifyItems,
  countDecisions,
  orderApprovalItems,
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
    { ...base, status: 'PENDING_APPROVAL' },
    can(M.approvePurchaseRequest, 'read')
  );
  const ordersPending = useOrders(
    { ...base, status: 'PENDING_APPROVAL' },
    can(M.approvePurchaseOrder, 'read')
  );
  const paymentsPending = usePayments(
    { ...base, status: 'PENDING_APPROVAL' },
    can(M.approvePayment, 'read')
  );
  const paymentsReady = usePayments({ ...base, status: 'APPROVED' }, can(M.payments, 'update'));
  const billsDraft = useBills({ ...base, status: 'DRAFT' }, canDocs && can(M.documents, 'update'));
  const ordersApproved = useOrders({ ...base, status: 'APPROVED' }, canDocs);
  const ordersPartial = useOrders({ ...base, status: 'PARTIAL_RECEIVED' }, canDocs);
  const aging = usePayablesAging({}, can(M.reports, 'read'));

  const queries = [
    requests,
    ordersPending,
    paymentsPending,
    paymentsReady,
    billsDraft,
    ordersApproved,
    ordersPartial,
  ];

  const items = useMemo<WorkItem[]>(
    () =>
      sortWorkItems([
        ...requestItems(requests.data?.items ?? []),
        ...orderApprovalItems(ordersPending.data?.items ?? []),
        ...paymentApprovalItems(paymentsPending.data?.items ?? []),
        ...paymentReleaseItems(paymentsReady.data?.items ?? []),
        ...billVerifyItems(billsDraft.data?.items ?? []),
        ...orderFollowUpItems([
          ...(ordersApproved.data?.items ?? []),
          ...(ordersPartial.data?.items ?? []),
        ]),
      ]),
    [
      requests.data,
      ordersPending.data,
      paymentsPending.data,
      paymentsReady.data,
      billsDraft.data,
      ordersApproved.data,
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
