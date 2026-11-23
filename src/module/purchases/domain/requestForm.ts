import type { PurchaseRequestInput } from '@/module/purchases/domain/purchaseInputs';
import type { WarehouseRef } from '@/module/purchases/domain/purchaseCommon';
import type { PurchaseRequest, RequestItemKind } from '@/module/purchases/domain/purchaseRequest';

/** Lengths the service accepts; a longer value is refused with a 400. */
export const REQUEST_LIMITS = {
  purpose: 1000,
  memo: 2000,
  iomNumber: 100,
  description: 500,
  specification: 1000,
} as const;

/** The smallest quantity the service accepts. */
export const MIN_QUANTITY = 0.01;

export interface RequestFormItem {
  /** Local key so rows keep their identity while editing. */
  key: string;
  kind: RequestItemKind;
  productId: string;
  productName: string;
  unitId: string;
  description: string;
  specification: string;
  /** Empty string while the field is blank. */
  quantity: number | '';
}

export interface RequestFormValues {
  transactionDate: string;
  requiredDate: string;
  departmentId: string;
  /** Where the goods go; asked for only while a line is goods. */
  deliveryWarehouseId: string;
  purpose: string;
  iomNumber: string;
  iomDate: string;
  memo: string;
  items: RequestFormItem[];
}

export type RequestFormErrors = {
  transactionDate?: 'required';
  requiredDate?: 'required' | 'beforeDate';
  department?: 'required';
  deliveryWarehouse?: 'required';
  purpose?: 'required' | 'tooLong';
  iomNumber?: 'tooLong';
  memo?: 'tooLong';
  items?: 'empty';
  itemRows: Record<
    string,
    {
      description?: 'required' | 'tooLong';
      specification?: 'tooLong';
      quantity?: 'min';
    }
  >;
};

let counter = 0;
export const newItemKey = (): string => {
  counter += 1;
  return `item-${counter}`;
};

export const emptyRequestItem = (kind: RequestItemKind = 'GOODS'): RequestFormItem => ({
  key: newItemKey(),
  kind,
  productId: '',
  productName: '',
  unitId: '',
  description: '',
  specification: '',
  quantity: 1,
});

/** Goods are delivered somewhere; a request of services only has no delivery warehouse. */
export const needsDeliveryWarehouse = (items: RequestFormItem[]): boolean =>
  items.some((item) => item.kind === 'GOODS');

/** The warehouse a new request starts on: the main one, when the list names it. */
export const mainWarehouseId = (warehouses: WarehouseRef[]): string =>
  warehouses.find((warehouse) => warehouse.isDefault)?.id ?? '';

export const emptyRequestForm = (today: string): RequestFormValues => ({
  transactionDate: today,
  requiredDate: '',
  departmentId: '',
  deliveryWarehouseId: '',
  purpose: '',
  iomNumber: '',
  iomDate: '',
  memo: '',
  items: [emptyRequestItem()],
});

export const requestToForm = (doc: PurchaseRequest): RequestFormValues => ({
  transactionDate: doc.date,
  requiredDate: doc.requiredDate ?? '',
  departmentId: doc.department?.id ?? '',
  deliveryWarehouseId: doc.deliveryWarehouse?.id ?? '',
  purpose: doc.purpose,
  iomNumber: doc.iom.number,
  iomDate: doc.iom.date ?? '',
  memo: doc.memo,
  items: doc.items.map((item) => ({
    key: newItemKey(),
    kind: item.kind,
    productId: item.product?.id ?? '',
    productName: item.product?.name ?? '',
    unitId: item.unit?.id ?? '',
    description: item.description,
    specification: item.specification,
    quantity: item.quantity,
  })),
});

/** A line is valid with a product or a description; a quantity below the minimum is refused. */
export const validateRequestForm = (values: RequestFormValues): RequestFormErrors => {
  const errors: RequestFormErrors = { itemRows: {} };
  if (!values.transactionDate) errors.transactionDate = 'required';
  if (!values.requiredDate) errors.requiredDate = 'required';
  else if (values.transactionDate && values.requiredDate < values.transactionDate) {
    errors.requiredDate = 'beforeDate';
  }
  if (!values.departmentId) errors.department = 'required';
  if (needsDeliveryWarehouse(values.items) && !values.deliveryWarehouseId) {
    errors.deliveryWarehouse = 'required';
  }
  const purpose = values.purpose.trim();
  if (!purpose) errors.purpose = 'required';
  else if (purpose.length > REQUEST_LIMITS.purpose) errors.purpose = 'tooLong';
  if (values.iomNumber.trim().length > REQUEST_LIMITS.iomNumber) errors.iomNumber = 'tooLong';
  if (values.memo.trim().length > REQUEST_LIMITS.memo) errors.memo = 'tooLong';
  if (values.items.length === 0) errors.items = 'empty';
  values.items.forEach((item) => {
    const row: RequestFormErrors['itemRows'][string] = {};
    const description = item.description.trim();
    if (!item.productId && !description) row.description = 'required';
    else if (description.length > REQUEST_LIMITS.description) row.description = 'tooLong';
    if (item.specification.trim().length > REQUEST_LIMITS.specification) {
      row.specification = 'tooLong';
    }
    if (item.quantity === '' || !(item.quantity >= MIN_QUANTITY)) row.quantity = 'min';
    if (Object.keys(row).length > 0) errors.itemRows[item.key] = row;
  });
  return errors;
};

export const hasRequestErrors = (errors: RequestFormErrors): boolean =>
  Boolean(
    errors.transactionDate ||
    errors.requiredDate ||
    errors.department ||
    errors.deliveryWarehouse ||
    errors.purpose ||
    errors.iomNumber ||
    errors.memo ||
    errors.items ||
    Object.keys(errors.itemRows).length
  );

/** The request body. A service has no product; a product's unit is the line's unit unless changed. */
export const toRequestInput = (values: RequestFormValues): PurchaseRequestInput => ({
  transactionDate: values.transactionDate,
  requiredDate: values.requiredDate,
  department: values.departmentId,
  ...(needsDeliveryWarehouse(values.items) && values.deliveryWarehouseId
    ? { deliveryWarehouseId: values.deliveryWarehouseId }
    : {}),
  purpose: values.purpose.trim(),
  iom: { number: values.iomNumber.trim(), date: values.iomDate || null },
  memo: values.memo.trim(),
  items: values.items.map((item) => ({
    ...(item.productId ? { product: item.productId } : {}),
    kind: item.kind,
    description: item.description.trim(),
    specification: item.specification.trim(),
    quantity: Number(item.quantity),
    ...(item.unitId ? { unit: item.unitId } : {}),
  })),
});
