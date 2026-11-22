import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import type { OrderDraftInput } from '@/module/purchases/domain/purchaseInputs';

/** Lengths the service accepts; a longer value is refused with a 400. */
export const DRAFT_LIMITS = { address: 500, memo: 2000 } as const;

export interface DraftValues {
  transactionDate: string;
  expectedDate: string;
  warehouseId: string;
  deliveryAddress: string;
  memo: string;
}

export interface DraftErrors {
  transactionDate?: 'required';
  expectedDate?: 'beforeDate';
  deliveryAddress?: 'tooLong';
  memo?: 'tooLong';
}

export const orderToDraft = (order: PurchaseOrder): DraftValues => ({
  transactionDate: order.date,
  expectedDate: order.expectedDate ?? '',
  warehouseId: order.warehouse?.id ?? '',
  deliveryAddress: order.deliveryAddress,
  memo: order.memo,
});

/** The service accepts an expected date before the order date; the screen does not. */
export const validateDraft = (values: DraftValues): DraftErrors => {
  const errors: DraftErrors = {};
  if (!values.transactionDate) errors.transactionDate = 'required';
  if (
    values.expectedDate &&
    values.transactionDate &&
    values.expectedDate < values.transactionDate
  ) {
    errors.expectedDate = 'beforeDate';
  }
  if (values.deliveryAddress.trim().length > DRAFT_LIMITS.address) {
    errors.deliveryAddress = 'tooLong';
  }
  if (values.memo.trim().length > DRAFT_LIMITS.memo) errors.memo = 'tooLong';
  return errors;
};

export const hasDraftErrors = (errors: DraftErrors): boolean => Object.keys(errors).length > 0;

/** An emptied date or warehouse is sent as null so it is cleared. */
export const draftToInput = (values: DraftValues): OrderDraftInput => ({
  transactionDate: values.transactionDate,
  expectedDate: values.expectedDate || null,
  warehouse: values.warehouseId || null,
  deliveryAddress: values.deliveryAddress.trim(),
  memo: values.memo.trim(),
});
