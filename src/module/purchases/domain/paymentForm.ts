import { sumMinor, toMinor } from '@/lib/money/money';
import type { PartyRef } from '@/module/purchases/domain/purchaseCommon';
import type {
  PaymentRequest,
  PaymentRequestVendorTotal,
} from '@/module/purchases/domain/paymentRequest';

/** An approved Payment Request waiting for a voucher. */
export interface ReadyRequest {
  id: string;
  number: string;
  kind: PaymentRequest['kind'];
  vendorId: string;
  vendorName: string;
  amount: number;
  dueDate: string | null;
  /** The bill or the order the money goes to, for the list. */
  target: string;
}

export const toReadyRequest = (doc: PaymentRequest): ReadyRequest => ({
  id: doc.id,
  number: doc.number,
  kind: doc.kind,
  vendorId: doc.vendor?.id ?? '',
  vendorName: doc.vendor?.name ?? '-',
  amount: doc.amount,
  dueDate: doc.dueDate,
  target:
    doc.kind === 'DP'
      ? (doc.order?.number ?? '')
      : doc.items.map((item) => item.bill.number).join(', '),
});

/** Requests of one vendor can share a voucher; the first one picked decides the vendor. */
export const compatibleRequest = (picked: ReadyRequest[], candidate: ReadyRequest): boolean =>
  picked.length === 0 || picked.every((request) => request.vendorId === candidate.vendorId);

export interface PaymentFormValues {
  date: string;
  paymentMethodId: string;
  depositAccountId: string;
  referenceNumber: string;
  memo: string;
}

export const emptyPaymentForm = (date: string): PaymentFormValues => ({
  date,
  paymentMethodId: '',
  depositAccountId: '',
  referenceNumber: '',
  memo: '',
});

export interface PaymentFormErrors {
  date?: 'dateRequired';
  requests?: 'noRequests';
}

export const hasPaymentErrors = (errors: PaymentFormErrors): boolean =>
  Boolean(errors.date || errors.requests);

export const validatePaymentForm = (
  values: PaymentFormValues,
  picked: ReadyRequest[]
): PaymentFormErrors => ({
  ...(values.date ? {} : { date: 'dateRequired' as const }),
  ...(picked.length > 0 ? {} : { requests: 'noRequests' as const }),
});

export interface PaymentVoucherInput {
  transactionDate: string;
  paymentRequests: string[];
  /** Only the bills of this vendor go into the voucher; for a request with several vendors. */
  vendor?: string;
  paymentMethod?: string;
  depositAccount?: string;
  referenceNumber?: string;
  memo?: string;
}

export const toPaymentInput = (
  values: PaymentFormValues,
  picked: ReadyRequest[],
  vendorId?: string
): PaymentVoucherInput => ({
  transactionDate: values.date,
  paymentRequests: picked.map((request) => request.id),
  ...(vendorId ? { vendor: vendorId } : {}),
  ...(values.paymentMethodId ? { paymentMethod: values.paymentMethodId } : {}),
  ...(values.depositAccountId ? { depositAccount: values.depositAccountId } : {}),
  ...(values.referenceNumber.trim() ? { referenceNumber: values.referenceNumber.trim() } : {}),
  ...(values.memo.trim() ? { memo: values.memo.trim() } : {}),
});

/** What a voucher shows while it is made: how much it pays and for whom. */
export const voucherTotal = (picked: ReadyRequest[]): number =>
  sumMinor(picked.map((request) => toMinor(request.amount))) / 100;

export const voucherVendor = (picked: ReadyRequest[]): Pick<PartyRef, 'id'> | null =>
  picked[0] ? { id: picked[0].vendorId } : null;

/* ---------- Paying a voucher ---------- */

export interface PayFormValues {
  paidAt: string;
  depositAccountId: string;
  paymentMethodId: string;
  adminFee: number | '';
  referenceNumber: string;
}

export interface PayFormErrors {
  paidAt?: 'dateRequired';
  depositAccountId?: 'depositRequired';
  referenceNumber?: 'referenceRequired';
  attachments?: 'attachmentRequired';
  adminFee?: 'feeInvalid';
}

export const hasPayErrors = (errors: PayFormErrors): boolean => Object.keys(errors).length > 0;

/**
 * The server falls back to a default cash account when none is sent, which would book the payment to a
 * bank nobody chose; the form insists on a choice instead.
 */
export const validatePayForm = (values: PayFormValues, hasProof: boolean): PayFormErrors => ({
  ...(values.paidAt ? {} : { paidAt: 'dateRequired' as const }),
  ...(values.depositAccountId ? {} : { depositAccountId: 'depositRequired' as const }),
  ...(values.referenceNumber.trim() ? {} : { referenceNumber: 'referenceRequired' as const }),
  ...(hasProof ? {} : { attachments: 'attachmentRequired' as const }),
  ...(values.adminFee !== '' && (!Number.isFinite(values.adminFee) || values.adminFee < 0)
    ? { adminFee: 'feeInvalid' as const }
    : {}),
});

export interface PayInput {
  paidAt: string;
  depositAccount: string;
  paymentMethod?: string;
  adminFee?: number;
  referenceNumber: string;
}

export const toPayInput = (values: PayFormValues): PayInput => ({
  paidAt: values.paidAt,
  depositAccount: values.depositAccountId,
  ...(values.paymentMethodId ? { paymentMethod: values.paymentMethodId } : {}),
  ...(values.adminFee === '' ? {} : { adminFee: values.adminFee }),
  referenceNumber: values.referenceNumber.trim(),
});

/** What leaves the bank: the amount paid plus the admin fee, added in whole minor units. */
export const cashOutOf = (total: number, adminFee: number): number =>
  sumMinor([toMinor(total), toMinor(adminFee)]) / 100;

/* ---------- Vouchers of a request with several vendors ---------- */

/**
 * How vouchers can be issued for a request with several vendors: all vendors at once while none has
 * a voucher, or one vendor at a time for the ones that still lack one.
 */
export const issueOptions = (
  request: PaymentRequest
): { allAtOnce: boolean; pending: PaymentRequestVendorTotal[] } => {
  if (!request.isMultiVendor) return { allAtOnce: false, pending: [] };
  const pending = request.vendorTotals.filter((total) => total.voucher === null);
  return { allAtOnce: pending.length === request.vendorTotals.length, pending };
};

/** What the chosen scope pays: every vendor still without a voucher (`all`), or one vendor. */
export const scopeAmount = (request: PaymentRequest, scope: 'all' | string): number => {
  const { pending } = issueOptions(request);
  const chosen = scope === 'all' ? pending : pending.filter((total) => total.vendorId === scope);
  return sumMinor(chosen.map((total) => toMinor(total.amount))) / 100;
};
