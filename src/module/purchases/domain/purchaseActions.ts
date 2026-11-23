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
    /** Accounting sends it back only before verifying it; the service refuses a verified one (400, 2026-11-23). */
    return: doc.status === 'SUBMITTED',
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
    /** The advance of the payment term, not yet fully asked for in Payment Requests. */
    requestAdvance: (live || doc.status === 'RECEIVED') && doc.advance.available > 0,
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

/**
 * What the status of a bill allows. Payment is asked for through a Payment Request (slice 8), and a bill
 * that sits inside one, or already has a payment, return or credit, cannot be voided.
 */
export const billActions = (doc: PurchaseBill) => {
  const settled =
    doc.paidAmount > 0 ||
    doc.returnedAmount > 0 ||
    doc.creditAppliedAmount > 0 ||
    doc.heldAmount > 0;
  const open = doc.status === 'VERIFIED' || doc.status === 'PARTIAL_PAID';
  return {
    edit: doc.status === 'DRAFT',
    verify: doc.status === 'DRAFT',
    void: (doc.status === 'DRAFT' || doc.status === 'VERIFIED') && !settled,
    requestPayment: open && doc.requestableAmount > 0,
    applyCredit: open && doc.remainingAmount > 0,
    createReturn: open || doc.status === 'PAID',
  };
};

/** A voucher is paid straight from its draft; a paid one can still be voided, which reverses the journal. */
export const voucherActions = (doc: PaymentVoucher) => ({
  pay: doc.status === 'DRAFT',
  void: doc.status !== 'VOID',
});

export const returnActions = (doc: PurchaseReturn) => ({
  edit: doc.status === 'DRAFT',
  post: doc.status === 'DRAFT',
  /** A posted REFUND return waits for the vendor's money; each refund takes from what is left. */
  refund: doc.status === 'POSTED' && doc.settlement === 'REFUND' && doc.creditRemaining > 0,
  void: doc.status === 'DRAFT' || doc.status === 'POSTED',
});

/** A bill is overdue when it still owes money after its due date. Not stored by the server. */
export const isBillOverdue = (bill: PurchaseBill, today: string): boolean =>
  (bill.status === 'VERIFIED' || bill.status === 'PARTIAL_PAID') &&
  bill.remainingAmount > 0 &&
  bill.dueDate !== null &&
  bill.dueDate < today;
