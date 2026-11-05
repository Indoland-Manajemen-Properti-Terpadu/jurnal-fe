import type {
  GoodsReceipt,
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseRequest,
  PurchaseReturn,
} from '@/module/purchases/domain/purchaseDocuments';

/**
 * Which actions a document offers in its current status. These are the same gates the server
 * enforces; the server stays the authority and a refused call is reported back to the user.
 * Access rights are applied separately by the screens.
 */

const editable = (status: string) => status === 'DRAFT' || status === 'REJECTED';

export const requestActions = (doc: PurchaseRequest) => ({
  edit: editable(doc.status),
  submit: editable(doc.status),
  decide: doc.status === 'PENDING_APPROVAL' && doc.approval.canDecide,
  fillQuotations:
    doc.mode === 'WITH_QUOTATION' &&
    (doc.status === 'APPROVED' || doc.status === 'VENDOR_SELECTED'),
  selectVendor:
    doc.mode === 'WITH_QUOTATION' &&
    (doc.status === 'APPROVED' || doc.status === 'VENDOR_SELECTED') &&
    doc.quotations.length > 0,
  createOrder:
    (doc.mode === 'DIRECT' && doc.status === 'APPROVED') ||
    (doc.mode === 'WITH_QUOTATION' && doc.status === 'VENDOR_SELECTED'),
  cancel: doc.status !== 'CONVERTED' && doc.status !== 'CANCELLED',
});

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const QTY_EPSILON = 1e-4;

export const orderActions = (doc: PurchaseOrder) => {
  const received = sum(doc.items.map((item) => item.receivedQty));
  const billed = sum(doc.items.map((item) => item.billedQty));
  const open = doc.status === 'APPROVED' || doc.status === 'PARTIAL_RECEIVED';
  return {
    edit: editable(doc.status),
    submit: editable(doc.status),
    decide: doc.status === 'PENDING_APPROVAL' && doc.approval.canDecide,
    receive: open,
    billable:
      doc.status !== 'VOID' &&
      doc.items.some((item) => item.receivedQty - item.billedQty > QTY_EPSILON),
    close: open || doc.status === 'RECEIVED',
    void:
      doc.status !== 'CLOSED' &&
      doc.status !== 'VOID' &&
      received < QTY_EPSILON &&
      billed < QTY_EPSILON,
  };
};

export const receiptActions = (doc: GoodsReceipt) => ({ void: doc.status === 'POSTED' });

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
