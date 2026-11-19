import { roundToCents } from '../domain/saleMoney';
import type { ReturnFormValues } from '../domain/saleReturnForm';

const items = (values: ReturnFormValues) =>
  values.lines
    .filter((line) => line.returnQty > 0)
    .map((line) => ({ saleItem: line.saleItem, quantity: line.returnQty }));

/** Create body: the invoice is chosen once and never sent again on an edit. */
export const buildReturnCreateBody = (values: ReturnFormValues) => ({
  sale: values.sale,
  transactionDate: values.transactionDate,
  reason: values.reason,
  settlement: values.settlement,
  memo: values.memo,
  items: items(values),
});

export const buildReturnUpdateBody = (values: ReturnFormValues) => ({
  transactionDate: values.transactionDate,
  reason: values.reason,
  settlement: values.settlement,
  memo: values.memo,
  items: items(values),
});

export interface ApplyCreditInput {
  /** The invoice the credit pays. */
  sale: string;
  amount: number;
  appliedAt: string;
}

export const buildApplyBody = (input: ApplyCreditInput) => ({
  sale: input.sale,
  amount: roundToCents(input.amount),
  appliedAt: input.appliedAt,
});

export interface RefundInput {
  depositAccount: string;
  refundDate: string;
  memo: string;
}

export const buildRefundBody = (input: RefundInput) => ({
  depositAccount: input.depositAccount,
  refundDate: input.refundDate,
  ...(input.memo.trim() ? { memo: input.memo.trim() } : {}),
});
