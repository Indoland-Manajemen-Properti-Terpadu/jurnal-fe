import type { ProcurementMode, PurchaseRequest } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseRequestInput } from '@/module/purchases/domain/purchaseInputs';

export interface RequestFormItem {
  /** Local key so rows keep their identity while editing. */
  key: string;
  productId: string;
  productName: string;
  unitName: string;
  description: string;
  /** Empty string while the field is blank. */
  quantity: number | '';
}

export interface RequestFormValues {
  transactionDate: string;
  requiredDate: string;
  department: string;
  purpose: string;
  mode: ProcurementMode;
  memo: string;
  items: RequestFormItem[];
}

export type RequestFormErrors = {
  transactionDate?: 'required';
  requiredDate?: 'beforeDate';
  items?: 'empty';
  itemRows: Record<string, { description?: 'required'; quantity?: 'positive' }>;
};

let counter = 0;
export const newItemKey = (): string => {
  counter += 1;
  return `item-${counter}`;
};

export const emptyRequestItem = (): RequestFormItem => ({
  key: newItemKey(),
  productId: '',
  productName: '',
  unitName: '',
  description: '',
  quantity: 1,
});

export const emptyRequestForm = (today: string): RequestFormValues => ({
  transactionDate: today,
  requiredDate: '',
  department: '',
  purpose: '',
  mode: 'DIRECT',
  memo: '',
  items: [emptyRequestItem()],
});

export const requestToForm = (doc: PurchaseRequest): RequestFormValues => ({
  transactionDate: doc.date,
  requiredDate: doc.requiredDate ?? '',
  department: doc.department,
  purpose: doc.purpose,
  mode: doc.mode,
  memo: doc.memo,
  items: doc.items.map((item) => ({
    key: newItemKey(),
    productId: item.product?.id ?? '',
    productName: item.product?.name ?? '',
    unitName: item.unitName ?? '',
    description: item.description,
    quantity: item.quantity,
  })),
});

export const validateRequestForm = (values: RequestFormValues): RequestFormErrors => {
  const errors: RequestFormErrors = { itemRows: {} };
  if (!values.transactionDate) errors.transactionDate = 'required';
  if (
    values.requiredDate &&
    values.transactionDate &&
    values.requiredDate < values.transactionDate
  ) {
    errors.requiredDate = 'beforeDate';
  }
  if (values.items.length === 0) errors.items = 'empty';
  values.items.forEach((item) => {
    const row: RequestFormErrors['itemRows'][string] = {};
    if (!item.productId && !item.description.trim()) row.description = 'required';
    if (item.quantity === '' || !(item.quantity > 0)) row.quantity = 'positive';
    if (row.description || row.quantity) errors.itemRows[item.key] = row;
  });
  return errors;
};

export const hasRequestErrors = (errors: RequestFormErrors): boolean =>
  Boolean(
    errors.transactionDate ||
    errors.requiredDate ||
    errors.items ||
    Object.keys(errors.itemRows).length
  );

const optional = (value: string) => (value.trim() ? value.trim() : undefined);

/** Items carry only product, description and quantity: the service takes no price on a request. */
export const toRequestInput = (values: RequestFormValues): PurchaseRequestInput => ({
  transactionDate: values.transactionDate,
  requiredDate: optional(values.requiredDate),
  department: optional(values.department),
  purpose: optional(values.purpose),
  procurementMode: values.mode,
  memo: optional(values.memo),
  items: values.items.map((item) => ({
    ...(item.productId ? { product: item.productId } : {}),
    description: item.description.trim(),
    quantity: Number(item.quantity),
  })),
});
