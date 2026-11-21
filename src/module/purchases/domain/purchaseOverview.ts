import { orderActions, voucherActions } from '@/module/purchases/domain/purchaseActions';
import type {
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
} from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';

/** Why a document is on the work list; each reason has its own sentence in the overview. */
export type WorkReason =
  | 'verifyRequest'
  | 'sendOrder'
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
  verifyRequest: 0,
  sendOrder: 0,
  approvePayment: 0,
  payVoucher: 1,
  verifyBill: 2,
  receiveOrder: 3,
  billOrder: 3,
};

/** Submitted requests wait for Accounting to verify or return them. */
export const requestItems = (docs: PurchaseRequest[]): WorkItem[] =>
  docs
    .filter((doc) => doc.status === 'SUBMITTED')
    .map((doc) => ({
      key: `request:${doc.id}`,
      reason: 'verifyRequest' as const,
      docKind: 'request' as const,
      id: doc.id,
      number: doc.number,
      vendorName: '',
      amount: null,
      date: doc.date,
    }));

/** A drafted PO / SPK waits for Accounting to send it to the vendor. */
export const orderSendItems = (docs: PurchaseOrder[]): WorkItem[] =>
  docs
    .filter((doc) => orderActions(doc).send)
    .map((doc) => ({
      key: `order-send:${doc.id}`,
      reason: 'sendOrder' as const,
      docKind: 'order' as const,
      id: doc.id,
      number: doc.number,
      vendorName: doc.vendor.name,
      amount: doc.finalAmount,
      date: doc.date,
    }));

/** A sent or partly received order waits for goods, or for a bill when it takes no receipt. */
export const orderFollowUpItems = (docs: PurchaseOrder[]): WorkItem[] =>
  docs.flatMap((doc) => {
    const actions = orderActions(doc);
    const reason: WorkReason | null = actions.bill
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
