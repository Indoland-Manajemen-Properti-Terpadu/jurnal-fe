import { routes } from '@/router/routes';
import type { PurchaseStatus } from '@/module/purchases/domain/purchaseStatus';

/** What the chain endpoint calls the document the chain was asked from. */
export type ChainType =
  | 'purchaseRequest'
  | 'purchaseOrder'
  | 'goodsReceipt'
  | 'purchaseBill'
  | 'paymentRequest'
  | 'purchasePayment'
  | 'purchaseReturn';

export interface ChainDocument {
  id: string;
  number: string;
  status: string;
}

/** Every document linked to the one asked about, grouped by kind, oldest step first. */
export interface DocumentChain {
  purchaseRequests: ChainDocument[];
  purchaseOrders: ChainDocument[];
  goodsReceipts: ChainDocument[];
  purchaseBills: ChainDocument[];
  paymentRequests: ChainDocument[];
  purchasePayments: ChainDocument[];
  purchaseReturns: ChainDocument[];
}

export interface JourneyStepData {
  kind: 'request' | 'order' | 'receipt' | 'bill' | 'paymentRequest' | 'payment' | 'return';
  documents: { id: string; number: string; status: PurchaseStatus; to: string }[];
  current: boolean;
}

const STEPS: {
  kind: JourneyStepData['kind'];
  group: keyof DocumentChain;
  route: string;
  type: ChainType;
}[] = [
  {
    kind: 'request',
    group: 'purchaseRequests',
    route: routes.purchases.requestDetail,
    type: 'purchaseRequest',
  },
  {
    kind: 'order',
    group: 'purchaseOrders',
    route: routes.purchases.orderDetail,
    type: 'purchaseOrder',
  },
  {
    kind: 'receipt',
    group: 'goodsReceipts',
    route: routes.purchases.receiptDetail,
    type: 'goodsReceipt',
  },
  {
    kind: 'bill',
    group: 'purchaseBills',
    route: routes.purchases.billDetail,
    type: 'purchaseBill',
  },
  {
    kind: 'paymentRequest',
    group: 'paymentRequests',
    route: routes.purchases.paymentRequestDetail,
    type: 'paymentRequest',
  },
  {
    kind: 'payment',
    group: 'purchasePayments',
    route: routes.purchases.paymentDetail,
    type: 'purchasePayment',
  },
  {
    kind: 'return',
    group: 'purchaseReturns',
    route: routes.purchases.returnDetail,
    type: 'purchaseReturn',
  },
];

/**
 * The chain as steps of the journey card. The first six always show, so a step still ahead is
 * visible; returns show only when one exists. The document on screen is marked.
 */
export const chainSteps = (
  chain: DocumentChain,
  current?: { type: ChainType; id: string }
): JourneyStepData[] =>
  STEPS.filter((step) => step.kind !== 'return' || chain[step.group].length > 0).map((step) => ({
    kind: step.kind,
    current: current?.type === step.type,
    documents: chain[step.group].map((doc) => ({
      id: doc.id,
      number: doc.number,
      status: doc.status as PurchaseStatus,
      to: step.route.replace(':id', doc.id),
    })),
  }));
