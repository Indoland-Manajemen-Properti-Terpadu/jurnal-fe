import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import { PurchaseBill, PurchaseStatus } from './purchase';

export interface LineInput {
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface LineAmounts {
  subtotal: number;
  tax: number;
  total: number;
}

export interface BillTotals {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PaymentResult {
  paidAmount: number;
  remainingAmount: number;
  status: Extract<PurchaseStatus, 'PAID' | 'PARTIAL'>;
}

export interface PurchaseSummary {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdueAmount: number;
  overdueCount: number;
  billCount: number;
}

// Form inputs can carry more than two decimals (a free-typed price). The amount is rounded to the
// cent here, once, because `toMinor` rejects extra decimals instead of choosing a rounding rule.
const toCents = (amount: number): number => toMinor(Number(amount.toFixed(2)));

const toAmount = (minor: number): number => Number(fromMinor(minor));

const lineMinor = ({ quantity, unitPrice, taxRate }: LineInput) => {
  const subtotal = Math.round(quantity * toCents(unitPrice));
  const tax = Math.round((subtotal * taxRate) / 100);
  return { subtotal, tax };
};

export const isPastDue = (bill: PurchaseBill, now: number): boolean =>
  bill.remainingAmount > 0 && Boolean(bill.dueDate) && new Date(bill.dueDate).getTime() < now;

export const calculateLine = (line: LineInput): LineAmounts => {
  const { subtotal, tax } = lineMinor(line);
  return { subtotal: toAmount(subtotal), tax: toAmount(tax), total: toAmount(subtotal + tax) };
};

export const calculateTotals = (lines: LineInput[]): BillTotals => {
  const minor = lines.map(lineMinor);
  const subtotal = sumMinor(minor.map((line) => line.subtotal));
  const tax = sumMinor(minor.map((line) => line.tax));
  return {
    subtotal: toAmount(subtotal),
    taxAmount: toAmount(tax),
    totalAmount: toAmount(subtotal + tax),
  };
};

export const applyPayment = (
  bill: Pick<PurchaseBill, 'totalAmount' | 'paidAmount'>,
  amount: number
): PaymentResult => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError('Payment must be a positive amount');
  }
  const owed = toCents(bill.totalAmount) - toCents(bill.paidAmount);
  if (toCents(amount) > owed) {
    throw new RangeError('Payment exceeds the remaining amount');
  }
  const paid = sumMinor([toCents(bill.paidAmount), toCents(amount)]);
  const remaining = toCents(bill.totalAmount) - paid;
  return {
    paidAmount: toAmount(paid),
    remainingAmount: toAmount(remaining),
    status: remaining === 0 ? 'PAID' : 'PARTIAL',
  };
};

export const paidPercent = (paidAmount: number, totalAmount: number): number =>
  totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

export const summarizePurchases = (bills: PurchaseBill[], now: number): PurchaseSummary => {
  const minor = (pick: (bill: PurchaseBill) => number) =>
    sumMinor(bills.map((bill) => toCents(pick(bill) || 0)));
  const overdue = bills.filter((bill) => isPastDue(bill, now));

  return {
    totalAmount: toAmount(minor((bill) => bill.totalAmount)),
    paidAmount: toAmount(minor((bill) => bill.paidAmount)),
    remainingAmount: toAmount(minor((bill) => bill.remainingAmount)),
    overdueAmount: toAmount(sumMinor(overdue.map((bill) => toCents(bill.remainingAmount || 0)))),
    overdueCount: overdue.length,
    billCount: bills.length,
  };
};

const SETTLED_STATUSES: PurchaseStatus[] = ['PAID', 'CANCELLED', 'DRAFT'];

export const withDerivedStatus = (bill: PurchaseBill, now: number): PurchaseBill => {
  if (SETTLED_STATUSES.includes(bill.status)) return bill;
  return { ...bill, status: isPastDue(bill, now) ? 'OVERDUE' : bill.status };
};
