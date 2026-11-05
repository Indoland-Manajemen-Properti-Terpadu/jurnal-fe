import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import type { PaymentVoucher, PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import type { PaymentVoucherInput } from '@/module/purchases/domain/purchaseInputs';

export type PaymentMode = 'BILL' | 'ADVANCE';

export interface PayableBill {
  id: string;
  number: string;
  date: string;
  dueDate: string | null;
  remaining: number;
}

export interface PaymentFormValues {
  mode: PaymentMode;
  vendorId: string;
  date: string;
  paymentMethodId: string;
  referenceNumber: string;
  memo: string;
  /** Bills chosen for this voucher with the amount paid on each; a missing key is not chosen. */
  amounts: Record<string, number>;
  advanceAmount: number | '';
  purchaseOrderId: string;
}

/** A voucher changes only these fields; the vendor and the type are fixed once it exists. */
export interface PaymentUpdateInput {
  transactionDate: string;
  paymentMethod?: string;
  referenceNumber?: string;
  memo?: string;
  items?: { bill: string; amount: number }[];
  amount?: number;
  purchaseOrder?: string | null;
}

export const emptyPaymentForm = (mode: PaymentMode, date: string): PaymentFormValues => ({
  mode,
  vendorId: '',
  date,
  paymentMethodId: '',
  referenceNumber: '',
  memo: '',
  amounts: {},
  advanceAmount: '',
  purchaseOrderId: '',
});

export const toPayableBill = (bill: PurchaseBill): PayableBill => ({
  id: bill.id,
  number: bill.number,
  date: bill.date,
  dueDate: bill.dueDate,
  remaining: bill.remainingAmount,
});

/** Verified and partly paid bills side by side, the earliest due date first. */
export const mergePayableBills = (...lists: PurchaseBill[][]): PayableBill[] =>
  lists
    .flat()
    .filter((bill) => bill.remainingAmount > 0)
    .map(toPayableBill)
    .sort(
      (a, b) =>
        (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || a.number.localeCompare(b.number)
    );

/** A paid amount is never negative and never above what the bill still owes. */
export const clampAmount = (value: number | string, max: number): number => {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.min(number, max);
};

export const selectedBillIds = (values: PaymentFormValues): string[] => Object.keys(values.amounts);

export const billsTotal = (values: PaymentFormValues): number =>
  Number(fromMinor(sumMinor(Object.values(values.amounts).map((amount) => toMinor(amount || 0)))));

export const totalToPay = (values: PaymentFormValues): number =>
  values.mode === 'ADVANCE' ? Number(values.advanceAmount || 0) : billsTotal(values);

/** What leaves the bank: the payment plus the method's fee, which is booked as an expense. */
export const cashOut = (total: number, adminFee: number): number =>
  Number(fromMinor(toMinor(total) + toMinor(adminFee)));

/** Chooses a bill with its whole remaining balance, or drops it. */
export const toggleBill = (
  values: PaymentFormValues,
  bill: PayableBill,
  chosen: boolean
): PaymentFormValues => {
  const amounts = { ...values.amounts };
  if (chosen) amounts[bill.id] = bill.remaining;
  else delete amounts[bill.id];
  return { ...values, amounts };
};

export const payAllBills = (
  values: PaymentFormValues,
  bills: PayableBill[]
): PaymentFormValues => ({
  ...values,
  amounts: Object.fromEntries(bills.map((bill) => [bill.id, bill.remaining])),
});

export interface PaymentErrors {
  vendor: boolean;
  date: 'required' | 'beforeBill' | null;
  method: boolean;
  noBill: boolean;
  advanceAmount: boolean;
  zeroIds: string[];
  overIds: string[];
}

export const validatePayment = (values: PaymentFormValues, bills: PayableBill[]): PaymentErrors => {
  const chosen = bills.filter((bill) => bill.id in values.amounts);
  const zeroIds = chosen.filter((bill) => !(values.amounts[bill.id] > 0)).map((bill) => bill.id);
  const overIds = chosen
    .filter((bill) => values.amounts[bill.id] > bill.remaining)
    .map((bill) => bill.id);
  const latestBill = chosen.reduce((latest, bill) => (bill.date > latest ? bill.date : latest), '');

  let date: PaymentErrors['date'] = null;
  if (!values.date) date = 'required';
  else if (values.mode === 'BILL' && latestBill && values.date < latestBill) date = 'beforeBill';

  return {
    vendor: !values.vendorId,
    date,
    method: !values.paymentMethodId,
    noBill: values.mode === 'BILL' && selectedBillIds(values).length === 0,
    advanceAmount: values.mode === 'ADVANCE' && !(Number(values.advanceAmount) > 0),
    zeroIds,
    overIds,
  };
};

export const hasPaymentErrors = (errors: PaymentErrors): boolean =>
  errors.vendor ||
  errors.date !== null ||
  errors.method ||
  errors.noBill ||
  errors.advanceAmount ||
  errors.zeroIds.length > 0 ||
  errors.overIds.length > 0;

const optional = (value: string) => value.trim() || undefined;

export const toPaymentInput = (values: PaymentFormValues): PaymentVoucherInput => {
  const common = {
    transactionDate: values.date,
    vendor: values.vendorId,
    paymentMethod: optional(values.paymentMethodId),
    referenceNumber: optional(values.referenceNumber),
    memo: optional(values.memo),
  };
  if (values.mode === 'ADVANCE') {
    return {
      ...common,
      type: 'ADVANCE',
      amount: Number(values.advanceAmount),
      purchaseOrder: optional(values.purchaseOrderId),
    };
  }
  return {
    ...common,
    items: Object.entries(values.amounts).map(([bill, amount]) => ({ bill, amount })),
  };
};

export const toPaymentUpdateInput = (values: PaymentFormValues): PaymentUpdateInput => {
  const common = {
    transactionDate: values.date,
    paymentMethod: optional(values.paymentMethodId),
    referenceNumber: values.referenceNumber.trim(),
    memo: values.memo.trim(),
  };
  if (values.mode === 'ADVANCE') {
    return {
      ...common,
      amount: Number(values.advanceAmount),
      purchaseOrder: optional(values.purchaseOrderId) ?? null,
    };
  }
  return {
    ...common,
    items: Object.entries(values.amounts).map(([bill, amount]) => ({ bill, amount })),
  };
};

export const paymentFormFromVoucher = (doc: PaymentVoucher): PaymentFormValues => ({
  mode: doc.type === 'ADVANCE' ? 'ADVANCE' : 'BILL',
  vendorId: doc.vendor.id,
  date: doc.date,
  paymentMethodId: doc.paymentMethod?.id ?? '',
  referenceNumber: doc.referenceNumber,
  memo: doc.memo,
  amounts: Object.fromEntries(doc.lines.map((line) => [line.billId, line.amount])),
  advanceAmount: doc.type === 'ADVANCE' ? doc.totalAmount : '',
  purchaseOrderId: doc.purchaseOrderId ?? '',
});

/** Only vouchers that have not entered approval can be changed. */
export const canEditVoucher = (doc: PaymentVoucher): boolean =>
  doc.status === 'DRAFT' || doc.status === 'REJECTED';
