import { orderActions, voucherActions } from '@/module/purchases/domain/purchaseActions';
import type {
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseRequest,
} from '@/module/purchases/domain/purchaseDocuments';

/** Why a document is on the work list; each reason has its own sentence in the overview. */
export type WorkReason =
  | 'approveRequest'
  | 'approveOrder'
  | 'approvePayment'
  | 'payVoucher'
  | 'verifyBill'
  | 'receiveOrder'
  | 'billOrder';

export interface WorkItem {
  key: string;
  reason: WorkReason;
  docKind: 'request' | 'order' | 'bill' | 'payment';
  id: string;
  number: string;
  /** Empty for a request, which has no vendor yet. */
  vendorName: string;
  amount: number | null;
  date: string;
}

/** Lower comes first: decisions waiting on the user, then money to release, then follow-up. */
const PRIORITY: Record<WorkReason, number> = {
  approveRequest: 0,
  approveOrder: 0,
  approvePayment: 0,
  payVoucher: 1,
  verifyBill: 2,
  receiveOrder: 3,
  billOrder: 3,
};

export const requestItems = (docs: PurchaseRequest[]): WorkItem[] =>
  docs
    .filter((doc) => doc.status === 'PENDING_APPROVAL' && doc.approval.canDecide)
    .map((doc) => ({
      key: `request:${doc.id}`,
      reason: 'approveRequest' as const,
      docKind: 'request' as const,
      id: doc.id,
      number: doc.number,
      vendorName: '',
      amount: null,
      date: doc.date,
    }));

export const orderApprovalItems = (docs: PurchaseOrder[]): WorkItem[] =>
  docs
    .filter((doc) => orderActions(doc).decide)
    .map((doc) => ({
      key: `order-approval:${doc.id}`,
      reason: 'approveOrder' as const,
      docKind: 'order' as const,
      id: doc.id,
      number: doc.number,
      vendorName: doc.vendor.name,
      amount: doc.finalAmount,
      date: doc.date,
    }));

/** An approved or partly received order waits for goods, or for a bill on what arrived. */
export const orderFollowUpItems = (docs: PurchaseOrder[]): WorkItem[] =>
  docs.flatMap((doc) => {
    const actions = orderActions(doc);
    const reason: WorkReason | null = actions.billable
      ? 'billOrder'
      : actions.receive
        ? 'receiveOrder'
        : null;
    return reason
      ? [
          {
            key: `order-follow:${doc.id}`,
            reason,
            docKind: 'order' as const,
            id: doc.id,
            number: doc.number,
            vendorName: doc.vendor.name,
            amount: doc.finalAmount,
            date: doc.date,
          },
        ]
      : [];
  });

export const paymentApprovalItems = (docs: PaymentVoucher[]): WorkItem[] =>
  docs
    .filter((doc) => voucherActions(doc).decide)
    .map((doc) => ({
      key: `payment-approval:${doc.id}`,
      reason: 'approvePayment' as const,
      docKind: 'payment' as const,
      id: doc.id,
      number: doc.number,
      vendorName: doc.vendor.name,
      amount: doc.totalAmount,
      date: doc.date,
    }));

export const paymentReleaseItems = (docs: PaymentVoucher[]): WorkItem[] =>
  docs
    .filter((doc) => voucherActions(doc).pay)
    .map((doc) => ({
      key: `payment-pay:${doc.id}`,
      reason: 'payVoucher' as const,
      docKind: 'payment' as const,
      id: doc.id,
      number: doc.number,
      vendorName: doc.vendor.name,
      amount: doc.totalAmount,
      date: doc.date,
    }));

export const billVerifyItems = (docs: PurchaseBill[]): WorkItem[] =>
  docs
    .filter((doc) => doc.status === 'DRAFT')
    .map((doc) => ({
      key: `bill:${doc.id}`,
      reason: 'verifyBill' as const,
      docKind: 'bill' as const,
      id: doc.id,
      number: doc.number,
      vendorName: doc.vendor.name,
      amount: doc.finalAmount,
      date: doc.date,
    }));

/** Work in priority order, oldest first inside a priority. */
export const sortWorkItems = (items: WorkItem[]): WorkItem[] =>
  [...items].sort(
    (a, b) => PRIORITY[a.reason] - PRIORITY[b.reason] || a.date.localeCompare(b.date)
  );

/** Decisions the signed-in user can take right now. */
export const countDecisions = (items: WorkItem[]): number =>
  items.filter((item) => PRIORITY[item.reason] === 0).length;
