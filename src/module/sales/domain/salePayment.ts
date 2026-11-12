import type { CreateSalePaymentPayload } from './sale';
import { validateAttachments } from './saleFiles';
import { fromCents, toCents } from './saleMoney';

export type AllocationMode = 'manual' | 'auto';

/** How a payment relates to what the invoice still owes. */
export type PaymentKind = 'partial' | 'full' | 'overpaid';

export interface PaymentFormValues {
  depositAccount: string;
  paymentMethod: string;
  paymentDate: string;
  amount: number;
  memo: string;
  tags: string[];
  attachments: File[];
  /** Only used when the payment is partial. */
  allocation: AllocationMode;
  /** Manual allocation: amount per invoice line, keyed by the line's id. */
  itemAmounts: Record<string, number>;
  lateFee: number;
}

/** What the form needs to know about the invoice being paid. */
export interface PaymentTarget {
  remaining: number;
  outstandingLateFee: number;
  items: Array<{ id: string; outstandingAmount: number }>;
}

/** The order the server follows when it allocates by itself; the form only describes it. */
export const AUTO_ALLOCATION_ORDER = [
  'electric_utility',
  'water_utility',
  'ipl_sc',
  'ipl_sf',
  'other',
  'late_fee',
] as const;

/** A payment starts as the full outstanding amount, dated today, with nothing chosen for the rest. */
export const emptyPaymentForm = (today: string, remaining: number): PaymentFormValues => ({
  depositAccount: '',
  paymentMethod: '',
  paymentDate: today,
  amount: remaining,
  memo: '',
  tags: [],
  attachments: [],
  allocation: 'manual',
  itemAmounts: {},
  lateFee: 0,
});

export const paymentKind = (amount: number, remaining: number): PaymentKind => {
  const paid = toCents(amount || 0);
  const owed = toCents(remaining);
  if (paid < owed) return 'partial';
  return paid === owed ? 'full' : 'overpaid';
};

/** The part of a payment above the invoice, in currency units; 0 when there is none. */
export const overpaymentOf = (amount: number, remaining: number): number =>
  fromCents(Math.max(0, toCents(amount || 0) - toCents(remaining)));

/** Total placed on lines and the late fee, in cents. */
const allocatedCents = (values: PaymentFormValues): number =>
  Object.values(values.itemAmounts).reduce((sum, value) => sum + toCents(value || 0), 0) +
  toCents(values.lateFee || 0);

/** Amount still to be placed on a line or the fee ("belum teralokasi"); never negative. */
export const unallocatedAmount = (values: PaymentFormValues): number =>
  fromCents(Math.max(0, toCents(values.amount || 0) - allocatedCents(values)));

/**
 * Payment amount minus what is placed on lines and the fee, in currency units: above 0 is still
 * to be placed, below 0 is placed in excess, 0 is exactly allocated.
 */
export const allocationGap = (values: PaymentFormValues): number =>
  fromCents(toCents(values.amount || 0) - allocatedCents(values));

/** What "fill the rest" puts on a line: the open balance of the line or whatever is left. */
export const fillRestAmount = (
  values: PaymentFormValues,
  currentValue: number,
  outstanding: number
): number => {
  const available = toCents(unallocatedAmount(values)) + toCents(currentValue || 0);
  return fromCents(Math.min(toCents(outstanding), available));
};

export const itemErrorKey = (itemId: string) => `item:${itemId}`;

/** Errors by field; each value is an i18n key. Amounts are compared in cents. */
export const validatePayment = (
  values: PaymentFormValues,
  remaining: number,
  target?: PaymentTarget
): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!values.depositAccount) errors.depositAccount = 'validation.depositAccountRequired';
  if (!values.paymentMethod) errors.paymentMethod = 'validation.paymentMethodRequired';
  if (!values.paymentDate) errors.paymentDate = 'validation.paymentDateRequired';
  if (!(toCents(values.amount) > 0)) errors.amount = 'validation.amountPositive';

  const needsManualAllocation =
    !errors.amount &&
    paymentKind(values.amount, remaining) === 'partial' &&
    values.allocation === 'manual';
  if (needsManualAllocation && target) {
    for (const item of target.items) {
      const value = toCents(values.itemAmounts[item.id] || 0);
      if (value < 0) errors[itemErrorKey(item.id)] = 'validation.allocationNegative';
      else if (value > toCents(item.outstandingAmount)) {
        errors[itemErrorKey(item.id)] = 'validation.allocationExceedsItem';
      }
    }
    const fee = toCents(values.lateFee || 0);
    if (fee < 0) errors.lateFee = 'validation.allocationNegative';
    else if (fee > toCents(target.outstandingLateFee)) {
      errors.lateFee = 'validation.allocationExceedsLateFee';
    }
    if (allocatedCents(values) !== toCents(values.amount)) {
      errors.allocation = 'validation.allocationMismatch';
    }
  }

  const fileError = validateAttachments(values.attachments);
  if (fileError) errors.attachments = fileError;
  return errors;
};

/**
 * The body for the server. Allocation only travels with a partial payment: a full or larger payment
 * is spread by the server, and it ignores `autoAllocate` there.
 */
export const toPaymentPayload = (
  saleId: string,
  values: PaymentFormValues,
  remaining: number
): CreateSalePaymentPayload => {
  const payload: CreateSalePaymentPayload = {
    sale: saleId,
    depositAccount: values.depositAccount,
    paymentMethod: values.paymentMethod,
    paymentDate: values.paymentDate,
    amount: values.amount,
    memo: values.memo.trim() || null,
    tags: values.tags,
    attachments: values.attachments,
  };
  if (paymentKind(values.amount, remaining) !== 'partial') return payload;

  if (values.allocation === 'auto') return { ...payload, autoAllocate: true };
  return {
    ...payload,
    items: Object.entries(values.itemAmounts)
      .filter(([, amount]) => toCents(amount || 0) > 0)
      .map(([saleItem, amount]) => ({ saleItem, amount })),
    lateFeeAmount: values.lateFee || 0,
  };
};
