import { toMinor } from '@/lib/money/money';
import type {
  ApprovalState,
  DocumentBase,
  PartyRef,
} from '@/module/purchases/domain/purchaseCommon';
import type { DocumentRef, PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';

/** `DP` asks for the advance of an order; `SETTLEMENT` asks to pay one or more bills of one vendor. */
export type PaymentRequestKind = 'DP' | 'SETTLEMENT';

/** A vendor needs a complete bank account before a payment request is submitted. */
export const hasVendorBankAccount = (
  accounts: {
    bankName?: string | null;
    accountNumber?: string | null;
    accountHolder?: string | null;
  }[]
): boolean =>
  accounts.some((bank) =>
    Boolean(bank.bankName?.trim() && bank.accountNumber?.trim() && bank.accountHolder?.trim())
  );

export type PaymentRequestStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSED'
  | 'PAID'
  | 'CANCELLED';

/** Requested values stay private until the full approval chain is complete. */
export const paymentRequestAmountsVisible = (
  status: PaymentRequestStatus,
  approval?: Pick<ApprovalState, 'entries' | 'plan' | 'rejectionReason'>
): boolean =>
  status === 'APPROVED' ||
  status === 'PROCESSED' ||
  status === 'PAID' ||
  (status === 'CANCELLED' &&
    approval !== undefined &&
    approval.rejectionReason === null &&
    approval.plan.length > 0 &&
    approval.plan.every((level, index) => {
      const approvedRoles = new Set(
        approval.entries.filter((entry) => entry.level === index).map((entry) => entry.roleId)
      );
      if (level.roles.length === 0) return false;
      return level.mode === 'ANY'
        ? level.roles.some((role) => approvedRoles.has(role.id))
        : level.roles.every((role) => approvedRoles.has(role.id));
    }));

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
  /** The vendor of the bill; for a single-vendor request it is the request's vendor. */
  vendorId: string;
}

/** What one vendor of a request is asked for, and the voucher that was issued to it, if any. */
export interface PaymentRequestVendorTotal {
  vendorId: string;
  vendorName: string;
  amount: number;
  billCount: number;
  voucher: { id: string; number: string; status: string } | null;
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
  /** The first vendor; a request with several vendors lists all of them in `vendorTotals`. */
  vendor: PartyRef | null;
  isMultiVendor: boolean;
  vendorTotals: PaymentRequestVendorTotal[];
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

/** What each status allows. DP cancellation is handled from the order with its own history guard. */
export const paymentRequestActions = (doc: PaymentRequest) => ({
  edit: doc.status === 'DRAFT',
  submit: doc.status === 'DRAFT',
  decide: doc.status === 'PENDING_APPROVAL' && doc.approval.canDecide,
  cancel:
    doc.kind !== 'DP' && ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].includes(doc.status),
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
  /** Settlement: the vendors chosen in step one; each needs at least one bill. */
  vendorIds: string[];
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
  vendorIds: [],
  amounts: {},
  purchaseOrderId: '',
  advanceAmount: '',
  advanceAccountId: '',
});

export const paymentRequestToForm = (doc: PaymentRequest): PaymentRequestFormValues => ({
  kind: doc.kind,
  date: doc.date,
  memo: doc.memo,
  vendorIds:
    doc.vendorTotals.length > 0
      ? doc.vendorTotals.map((total) => total.vendorId)
      : doc.vendor
        ? [doc.vendor.id]
        : [],
  amounts: Object.fromEntries(doc.items.map((item) => [item.bill.id, item.amount])),
  purchaseOrderId: doc.order?.id ?? '',
  advanceAmount: doc.kind === 'DP' ? doc.amount : '',
  advanceAccountId: doc.advanceAccountId ?? '',
});

export interface PaymentRequestErrors {
  date?: 'dateRequired';
  /** Per bill id. */
  bills: Record<string, 'amountInvalid' | 'amountTooHigh'>;
  /** Per chosen vendor that has no bill picked. */
  vendors: Record<string, 'noBillForVendor'>;
  noBills?: 'noBills';
  order?: 'orderRequired';
  advance?: 'advanceInvalid' | 'advanceTooHigh';
}

export const hasPaymentRequestErrors = (errors: PaymentRequestErrors): boolean =>
  Boolean(errors.date || errors.noBills || errors.order || errors.advance) ||
  Object.keys(errors.bills).length > 0 ||
  Object.keys(errors.vendors).length > 0;

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
  limits: {
    requestable: Record<string, number>;
    available?: number;
    /** Bill id to vendor id, to tell which chosen vendor has no bill picked. */
    billVendor?: Record<string, string>;
  }
): PaymentRequestErrors => {
  const errors: PaymentRequestErrors = { bills: {}, vendors: {} };
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
    const { billVendor } = limits;
    if (billVendor) {
      const withBills = new Set(picked.map(([id]) => billVendor[id]));
      values.vendorIds.forEach((vendorId) => {
        if (!withBills.has(vendorId)) errors.vendors[vendorId] = 'noBillForVendor';
      });
    }
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
  /** The vendors chosen for a settlement; each must have a bill in `items`. */
  vendors?: string[];
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
    ? {
        ...(values.vendorIds.length > 0 ? { vendors: values.vendorIds } : {}),
        items: Object.entries(values.amounts).map(([bill, amount]) => ({ bill, amount })),
      }
    : { purchaseOrder: values.purchaseOrderId, ...advanceFields(values) }),
});

/** `PUT` keeps what is left out and rejects `kind`, so the update carries the whole body without it. */
export const toPaymentRequestUpdate = (values: PaymentRequestFormValues): PaymentRequestUpdate => {
  const input = toPaymentRequestInput(values);
  return {
    transactionDate: input.transactionDate,
    memo: values.memo.trim(),
    vendors: input.vendors,
    items: input.items,
    amount: input.amount,
    advanceAccount: input.advanceAccount,
  };
};

/** Bills that may be added next to the ones already chosen: the same vendor only. */
export const sameVendor = (picked: RequestableBill[], candidate: RequestableBill): boolean =>
  picked.length === 0 || picked.every((bill) => bill.vendorId === candidate.vendorId);

/** What is asked from each vendor: the typed amounts added up per vendor, in whole minor units. */
export const vendorSubtotals = (
  amounts: Record<string, number>,
  billVendor: Record<string, string>
): Record<string, number> => {
  const minor: Record<string, number> = {};
  Object.entries(amounts).forEach(([billId, amount]) => {
    const vendorId = billVendor[billId];
    if (!vendorId) return;
    minor[vendorId] = (minor[vendorId] ?? 0) + (minorOf(amount) ?? 0);
  });
  return Object.fromEntries(Object.entries(minor).map(([id, value]) => [id, value / 100]));
};

/** The vendor(s) of a request in words: one name, or every name for a request with several vendors. */
export const vendorLabel = (doc: PaymentRequest): string =>
  doc.isMultiVendor && doc.vendorTotals.length > 0
    ? doc.vendorTotals.map((total) => total.vendorName).join(', ')
    : (doc.vendor?.name ?? '');

/** For a request with several vendors: how many vendors already have a voucher; null for one vendor. */
export const voucherProgress = (doc: PaymentRequest): { issued: number; total: number } | null =>
  doc.isMultiVendor
    ? {
        issued: doc.vendorTotals.filter((total) => total.voucher !== null).length,
        total: doc.vendorTotals.length,
      }
    : null;
