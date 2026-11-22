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
  /** On a Payment Request: `DP` (advance) or `SETTLEMENT`. */
  kind?: string;
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

export type JourneyKind =
  | 'request'
  | 'procurement'
  | 'order'
  | 'advance'
  | 'receipt'
  | 'bill'
  | 'settlement'
  | 'voucher'
  | 'return';

/** done: happened; next: what comes now; todo: still ahead; skipped: this purchase did not need it. */
export type JourneyState = 'done' | 'next' | 'todo' | 'skipped';

export interface JourneyStepData {
  kind: JourneyKind;
  state: JourneyState;
  documents: { id: string; number: string; status: PurchaseStatus; to: string; current: boolean }[];
  /** The document on screen belongs to this step. */
  current: boolean;
}

const DEAD = new Set(['VOID', 'CANCELLED', 'REJECTED', 'RETURNED']);
const live = (docs: ChainDocument[]) => docs.filter((doc) => !DEAD.has(doc.status));

const toDocs = (docs: ChainDocument[], route: string, currentId?: string) =>
  docs.map((doc) => ({
    id: doc.id,
    number: doc.number,
    status: doc.status as PurchaseStatus,
    to: route.replace(':id', doc.id),
    current: doc.id === currentId,
  }));

/**
 * The chain as the steps of the journey card, as in the reference web: request, procurement, order,
 * an advance when one was asked for, receipt, bill, settlement, voucher and, once one exists, the
 * return. A purchase without a request skips the first two; the first step still open is `next`.
 */
export const chainSteps = (
  chain: DocumentChain,
  current?: { type: ChainType; id: string }
): JourneyStepData[] => {
  const advances = chain.paymentRequests.filter((doc) => doc.kind === 'DP');
  const settlements = chain.paymentRequests.filter((doc) => doc.kind !== 'DP');
  const hasOrders = live(chain.purchaseOrders).length > 0;
  const hasRequest = chain.purchaseRequests.length > 0;
  const ofType = (...types: ChainType[]) => Boolean(current && types.includes(current.type));
  const cid = (type: ChainType) => (current?.type === type ? current.id : undefined);
  const steps: JourneyStepData[] = [
    {
      kind: 'request',
      state: hasRequest ? 'done' : hasOrders ? 'skipped' : 'todo',
      documents: toDocs(
        chain.purchaseRequests,
        routes.purchases.requestDetail,
        cid('purchaseRequest')
      ),
      current: ofType('purchaseRequest'),
    },
    {
      kind: 'procurement',
      state: !hasRequest && hasOrders ? 'skipped' : hasOrders ? 'done' : 'todo',
      documents: [],
      current: false,
    },
    {
      kind: 'order',
      state: hasOrders ? 'done' : 'todo',
      documents: toDocs(chain.purchaseOrders, routes.purchases.orderDetail, cid('purchaseOrder')),
      current: ofType('purchaseOrder'),
    },
    ...(advances.length > 0
      ? [
          {
            kind: 'advance' as const,
            state: live(advances).length > 0 ? ('done' as const) : ('todo' as const),
            documents: toDocs(
              advances,
              routes.purchases.paymentRequestDetail,
              cid('paymentRequest')
            ),
            current: ofType('paymentRequest') && advances.some((doc) => doc.id === current?.id),
          },
        ]
      : []),
    {
      kind: 'receipt',
      state: live(chain.goodsReceipts).length > 0 ? 'done' : 'todo',
      documents: toDocs(chain.goodsReceipts, routes.purchases.receiptDetail, cid('goodsReceipt')),
      current: ofType('goodsReceipt'),
    },
    {
      kind: 'bill',
      state: live(chain.purchaseBills).length > 0 ? 'done' : 'todo',
      documents: toDocs(chain.purchaseBills, routes.purchases.billDetail, cid('purchaseBill')),
      current: ofType('purchaseBill'),
    },
    {
      kind: 'settlement',
      state: live(settlements).length > 0 ? 'done' : 'todo',
      documents: toDocs(settlements, routes.purchases.paymentRequestDetail, cid('paymentRequest')),
      current: ofType('paymentRequest') && settlements.some((doc) => doc.id === current?.id),
    },
    {
      kind: 'voucher',
      state: live(chain.purchasePayments).length > 0 ? 'done' : 'todo',
      documents: toDocs(
        chain.purchasePayments,
        routes.purchases.paymentDetail,
        cid('purchasePayment')
      ),
      current: ofType('purchasePayment'),
    },
    ...(chain.purchaseReturns.length > 0
      ? [
          {
            kind: 'return' as const,
            state: live(chain.purchaseReturns).length > 0 ? ('done' as const) : ('todo' as const),
            documents: toDocs(
              chain.purchaseReturns,
              routes.purchases.returnDetail,
              cid('purchaseReturn')
            ),
            current: ofType('purchaseReturn'),
          },
        ]
      : []),
  ];
  const next = steps.findIndex((step) => step.state === 'todo');
  return steps.map((step, index) => (index === next ? { ...step, state: 'next' as const } : step));
};
