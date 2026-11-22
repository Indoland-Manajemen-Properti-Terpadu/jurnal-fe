import { toMinor } from '@/lib/money/money';
import type {
  ApprovalState,
  DocumentBase,
  PartyRef,
} from '@/module/purchases/domain/purchaseCommon';
import type { DocumentRef, PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';

/** `DP` asks for the advance of an order; `SETTLEMENT` asks to pay one or more bills of one vendor. */
export type PaymentRequestKind = 'DP' | 'SETTLEMENT';

export type PaymentRequestStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSED'
  | 'PAID'
  | 'CANCELLED';

/** The bill of a settlement line, with what the server knows of it now. */
export interface PaymentRequestBill {
  id: string;
  number: string;
  vendorInvoiceNumber: string;
  dueDate: string | null;
  finalAmount: number;
  remainingAmount: number;
  status: string;
}

export interface PaymentRequestItem {
  bill: PaymentRequestBill;
  amount: number;
}

export interface PaymentRequestOrder {
  id: string;
  number: string;
  isService: boolean;
  total: number;
  status: string;
}

export interface PaymentRequest extends DocumentBase {
  /** The server's Indonesian labels. */
  statusLabel: string;
  kindLabel: string;
  kind: PaymentRequestKind;
  status: PaymentRequestStatus;
  vendor: PartyRef | null;
  amount: number;
  dueDate: string | null;
  order: PaymentRequestOrder | null;
  items: PaymentRequestItem[];
  advanceAccountId: string | null;
  advanceAppliedAmount: number;
  voucher: (DocumentRef & { totalAmount: number; paidAt: string | null }) | null;
  cancelReason: string | null;
  approval: ApprovalState;
}

export const PAYMENT_REQUEST_STATUSES: PaymentRequestStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'PROCESSED',
  'PAID',
  'CANCELLED',
];

/** What each status allows. A request can be cancelled until a voucher takes it. */
export const paymentRequestActions = (doc: PaymentRequest) => ({
  edit: doc.status === 'DRAFT',
  submit: doc.status === 'DRAFT',
  decide: doc.status === 'PENDING_APPROVAL' && doc.approval.canDecide,
  cancel: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(doc.status),
  createVoucher: doc.status === 'APPROVED',
});

/** A bill that can be put in a settlement: the vendor, and what is still free to ask for. */
export interface RequestableBill {
  id: string;
  number: string;
  vendorInvoiceNumber: string;
  vendorId: string;
  vendorName: string;
  dueDate: string | null;
  requestable: number;
}

/** Verified or part paid bills that still have something free to ask for, earliest due date first. */
export const requestableBills = (bills: PurchaseBill[]): RequestableBill[] =>
  bills
    .filter(
      (bill) =>
        (bill.status === 'VERIFIED' || bill.status === 'PARTIAL_PAID') && bill.requestableAmount > 0
    )
    .map((bill) => ({
      id: bill.id,
      number: bill.number,
      vendorInvoiceNumber: bill.vendorInvoiceNumber,
      vendorId: bill.vendor.id,
      vendorName: bill.vendor.name,
      dueDate: bill.dueDate,
      requestable: bill.requestableAmount,
    }))
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));

export interface PaymentRequestFormValues {
  kind: PaymentRequestKind;
  date: string;
  memo: string;
  /** Settlement: bills chosen with the amount asked on each; a missing key is not chosen. */
  amounts: Record<string, number>;
  /** Advance. */
  purchaseOrderId: string;
  advanceAmount: number | '';
  advanceAccountId: string;
}

export const emptyPaymentRequestForm = (
  kind: PaymentRequestKind,
  date: string
): PaymentRequestFormValues => ({
  kind,
  date,
  memo: '',
  amounts: {},
  purchaseOrderId: '',
  advanceAmount: '',
  advanceAccountId: '',
});

export const paymentRequestToForm = (doc: PaymentRequest): PaymentRequestFormValues => ({
  kind: doc.kind,
  date: doc.date,
  memo: doc.memo,
  amounts: Object.fromEntries(doc.items.map((item) => [item.bill.id, item.amount])),
  purchaseOrderId: doc.order?.id ?? '',
  advanceAmount: doc.kind === 'DP' ? doc.amount : '',
  advanceAccountId: doc.advanceAccountId ?? '',
});

export interface PaymentRequestErrors {
  date?: 'dateRequired';
  /** Per bill id. */
  bills: Record<string, 'amountInvalid' | 'amountTooHigh'>;
  noBills?: 'noBills';
  order?: 'orderRequired';
  advance?: 'advanceInvalid' | 'advanceTooHigh';
}

export const hasPaymentRequestErrors = (errors: PaymentRequestErrors): boolean =>
  Boolean(errors.date || errors.noBills || errors.order || errors.advance) ||
  Object.keys(errors.bills).length > 0;

const isAmount = (value: number | ''): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Whole minor units of a typed amount, or null when it has more than two decimals or is not a number. */
const minorOf = (value: number): number | null => {
  try {
    return toMinor(value);
  } catch {
    return null;
  }
};

/**
 * The server checks the same limits, but it also answers with English field lists; the form says what is
 * wrong beside the field. `requestable` maps a bill id to what it can still be asked for, and
 * `available` is what an order's advance still allows.
 */
export const validatePaymentRequestForm = (
  values: PaymentRequestFormValues,
  limits: { requestable: Record<string, number>; available?: number }
): PaymentRequestErrors => {
  const errors: PaymentRequestErrors = { bills: {} };
  if (!values.date) {
    errors.date = 'dateRequired';
  }
  if (values.kind === 'SETTLEMENT') {
    const picked = Object.entries(values.amounts);
    if (picked.length === 0) {
      errors.noBills = 'noBills';
    }
    picked.forEach(([id, amount]) => {
      const minor = minorOf(amount);
      if (minor === null || minor <= 0) {
        errors.bills[id] = 'amountInvalid';
      } else if (minor > (minorOf(limits.requestable[id] ?? 0) ?? 0)) {
        errors.bills[id] = 'amountTooHigh';
      }
    });
    return errors;
  }
  if (!values.purchaseOrderId) {
    errors.order = 'orderRequired';
  }
  const advance = isAmount(values.advanceAmount) ? minorOf(values.advanceAmount) : null;
  if (advance === null || advance <= 0) {
    errors.advance = 'advanceInvalid';
  } else if (limits.available !== undefined && advance > (minorOf(limits.available) ?? 0)) {
    errors.advance = 'advanceTooHigh';
  }
  return errors;
};

export interface PaymentRequestInput {
  kind: PaymentRequestKind;
  transactionDate: string;
  memo?: string;
  items?: { bill: string; amount: number }[];
  purchaseOrder?: string;
  amount?: number;
  advanceAccount?: string;
}

/** What may change on a draft; the kind and the order are fixed once it exists. */
export type PaymentRequestUpdate = Omit<PaymentRequestInput, 'kind' | 'purchaseOrder'>;

const advanceFields = (values: PaymentRequestFormValues) => ({
  amount: isAmount(values.advanceAmount) ? values.advanceAmount : 0,
  ...(values.advanceAccountId ? { advanceAccount: values.advanceAccountId } : {}),
});

export const toPaymentRequestInput = (values: PaymentRequestFormValues): PaymentRequestInput => ({
  kind: values.kind,
  transactionDate: values.date,
  ...(values.memo.trim() ? { memo: values.memo.trim() } : {}),
  ...(values.kind === 'SETTLEMENT'
    ? { items: Object.entries(values.amounts).map(([bill, amount]) => ({ bill, amount })) }
    : { purchaseOrder: values.purchaseOrderId, ...advanceFields(values) }),
});

/** `PUT` keeps what is left out and rejects `kind`, so the update carries the whole body without it. */
export const toPaymentRequestUpdate = (values: PaymentRequestFormValues): PaymentRequestUpdate => {
  const input = toPaymentRequestInput(values);
  return {
    transactionDate: input.transactionDate,
    memo: values.memo.trim(),
    items: input.items,
    amount: input.amount,
    advanceAccount: input.advanceAccount,
  };
};

/** Bills that may be added next to the ones already chosen: the same vendor only. */
export const sameVendor = (picked: RequestableBill[], candidate: RequestableBill): boolean =>
  picked.length === 0 || picked.every((bill) => bill.vendorId === candidate.vendorId);
