import type {
  GoodsReceipt,
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseReturn,
} from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';

/**
 * Which actions a document offers in its current status. These are the same gates the server
 * enforces; the server stays the authority and a refused call is reported back to the user.
 * Access rights are applied separately by the screens.
 */

const editable = (status: string) => status === 'DRAFT' || status === 'REJECTED';

/**
 * What the status of an FPPBJ allows. The requester edits, submits and cancels their own request
 * while it is a draft or sent back; Accounting verifies or returns it after it is submitted.
 * Rights and ownership are applied separately by the screens.
 */
export const requestActions = (doc: PurchaseRequest) => {
  const open = doc.status === 'DRAFT' || doc.status === 'RETURNED';
  return {
    edit: open,
    submit: open,
    attach: open,
    verify: doc.status === 'SUBMITTED',
    /** The service lets Accounting send it back until procurement starts. */
    return: doc.status === 'SUBMITTED' || doc.status === 'VERIFIED',
    cancel: open || doc.status === 'SUBMITTED' || doc.status === 'VERIFIED',
  };
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const QTY_EPSILON = 1e-4;

/**
 * What the status of a PO / SPK allows. Only a draft can be changed or sent; the prices were fixed
 * by the procurement. Receiving and billing depend on whether the quote asked for a receipt.
 */
export const orderActions = (doc: PurchaseOrder) => {
  const received = sum(doc.items.map((item) => item.receivedQty));
  const billed = sum(doc.items.map((item) => item.billedQty));
  const live = doc.status === 'SENT' || doc.status === 'PARTIAL_RECEIVED';
  return {
    edit: doc.status === 'DRAFT',
    send: doc.status === 'DRAFT',
    receive: doc.withReceipt && live,
    /** A bill straight from the order, for an order that takes no receipt. */
    bill: !doc.withReceipt && live && doc.billedAmount < doc.payableAmount,
    close: live || doc.status === 'RECEIVED',
    void:
      (doc.status === 'DRAFT' || doc.status === 'SENT') &&
      received < QTY_EPSILON &&
      billed < QTY_EPSILON,
  };
};

/** A confirmed receipt can be voided (until it is billed); a BAPP waits for approval or a resubmit. */
export const receiptActions = (doc: GoodsReceipt) => ({
  void: doc.status === 'POSTED',
  resubmit: doc.status === 'REJECTED',
  decide: doc.status === 'PENDING_APPROVAL' && doc.approval.canDecide,
});

export const billActions = (doc: PurchaseBill) => {
  const settled = doc.paidAmount > 0 || doc.returnedAmount > 0 || doc.creditAppliedAmount > 0;
  const open = doc.status === 'VERIFIED' || doc.status === 'PARTIAL_PAID';
  return {
    edit: doc.status === 'DRAFT',
    verify: doc.status === 'DRAFT',
    void: (doc.status === 'DRAFT' || doc.status === 'VERIFIED') && !settled,
    pay: open && doc.remainingAmount > 0,
    applyCredit: open && doc.remainingAmount > 0,
    createReturn: open || doc.status === 'PAID',
  };
};

export const voucherActions = (doc: PaymentVoucher) => ({
  edit: editable(doc.status),
  submit: editable(doc.status),
  decide: doc.status === 'PENDING_APPROVAL' && doc.approval.canDecide,
  pay: doc.status === 'APPROVED',
  void: doc.status !== 'VOID',
});

export const returnActions = (doc: PurchaseReturn) => ({
  edit: doc.status === 'DRAFT',
  post: doc.status === 'DRAFT',
  void: doc.status === 'DRAFT' || doc.status === 'POSTED',
});

/** A bill is overdue when it still owes money after its due date. Not stored by the server. */
export const isBillOverdue = (bill: PurchaseBill, today: string): boolean =>
  (bill.status === 'VERIFIED' || bill.status === 'PARTIAL_PAID') &&
  bill.remainingAmount > 0 &&
  bill.dueDate !== null &&
  bill.dueDate < today;
