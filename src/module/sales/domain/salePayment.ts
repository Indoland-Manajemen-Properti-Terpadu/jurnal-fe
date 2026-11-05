import type { CreateSalePaymentPayload } from './sale';
import { validateAttachments } from './saleFiles';
import { toCents } from './saleMoney';

export interface PaymentFormValues {
  depositAccount: string;
  paymentMethod: string;
  paymentDate: string;
  amount: number;
  memo: string;
  tags: string[];
  attachments: File[];
}

/** A payment starts as the full outstanding amount, dated today, with nothing chosen for the rest. */
export const emptyPaymentForm = (today: string, remaining: number): PaymentFormValues => ({
  depositAccount: '',
  paymentMethod: '',
  paymentDate: today,
  amount: remaining,
  memo: '',
  tags: [],
  attachments: [],
});

/** Errors by field; each value is an i18n key. Amounts are compared in cents. */
export const validatePayment = (
  values: PaymentFormValues,
  remaining: number
): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!values.depositAccount) errors.depositAccount = 'validation.depositAccountRequired';
  if (!values.paymentMethod) errors.paymentMethod = 'validation.paymentMethodRequired';
  if (!values.paymentDate) errors.paymentDate = 'validation.paymentDateRequired';
  if (!(toCents(values.amount) > 0)) errors.amount = 'validation.amountPositive';
  else if (toCents(values.amount) > toCents(remaining)) {
    errors.amount = 'validation.amountExceedsRemaining';
  }
  const fileError = validateAttachments(values.attachments);
  if (fileError) errors.attachments = fileError;
  return errors;
};

export const toPaymentPayload = (
  saleId: string,
  values: PaymentFormValues
): CreateSalePaymentPayload => ({
  sale: saleId,
  depositAccount: values.depositAccount,
  paymentMethod: values.paymentMethod,
  paymentDate: values.paymentDate,
  amount: values.amount,
  memo: values.memo.trim() || null,
  tags: values.tags,
  attachments: values.attachments,
});
