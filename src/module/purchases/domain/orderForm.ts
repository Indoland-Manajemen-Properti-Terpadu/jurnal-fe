import type {
  DiscountType,
  PurchaseOrder,
  PurchaseRequest,
  WithholdingType,
} from '@/module/purchases/domain/purchaseDocuments';
import type { OrderItemInput, PurchaseOrderInput } from '@/module/purchases/domain/purchaseInputs';
import type { TaxRef } from '@/module/purchases/domain/purchaseCommon';
import type { TotalsInput } from '@/module/purchases/domain/purchaseTotals';

export type AdjustmentType<T extends string> = '' | T;

export interface OrderFormItem {
  requestItemId: string;
  label: string;
  quantity: number;
  unitName: string;
  unitPrice: number | '';
  taxId: string;
}

export interface OrderFormValues {
  transactionDate: string;
  expectedDate: string;
  vendorId: string;
  paymentTermId: string;
  deliveryAddress: string;
  isPriceIncludeTax: boolean;
  discountType: AdjustmentType<DiscountType>;
  discountValue: number | '';
  withholdingType: AdjustmentType<WithholdingType>;
  withholdingValue: number | '';
  withholdingTaxCode: string;
  memo: string;
  items: OrderFormItem[];
}

/** A request can become an order only in these states (see the backend rules). */
export const canBecomeOrder = (request: PurchaseRequest): boolean =>
  (request.mode === 'DIRECT' && request.status === 'APPROVED') ||
  (request.mode === 'WITH_QUOTATION' && request.status === 'VENDOR_SELECTED');

export const selectedQuotation = (request: PurchaseRequest) =>
  request.quotations.find((quotation) => quotation.id === request.selectedQuotationId) ?? null;

const itemLabel = (item: { product: { name: string } | null; description: string }) =>
  [item.product?.name, item.description].filter(Boolean).join(' · ');

export const orderFromRequest = (request: PurchaseRequest, today: string): OrderFormValues => {
  const quotation = selectedQuotation(request);
  return {
    transactionDate: today,
    expectedDate: request.requiredDate ?? '',
    vendorId: quotation?.vendor.id ?? '',
    paymentTermId: '',
    deliveryAddress: '',
    isPriceIncludeTax: false,
    discountType: '',
    discountValue: '',
    withholdingType: '',
    withholdingValue: '',
    withholdingTaxCode: '',
    memo: '',
    items: request.items.map((item) => ({
      requestItemId: item.id,
      label: itemLabel(item),
      quantity: item.quantity,
      unitName: item.unitName ?? '',
      unitPrice: quotation?.items.find((line) => line.requestItemId === item.id)?.unitPrice ?? '',
      taxId: '',
    })),
  };
};

export const orderToForm = (order: PurchaseOrder): OrderFormValues => ({
  transactionDate: order.date,
  expectedDate: order.expectedDate ?? '',
  vendorId: order.vendor.id,
  paymentTermId: '',
  deliveryAddress: order.deliveryAddress,
  isPriceIncludeTax: order.isPriceIncludeTax,
  discountType: order.discountType ?? '',
  discountValue: order.discountType ? order.discountValue : '',
  withholdingType: order.withholdingType ?? '',
  withholdingValue: order.withholdingType ? order.withholdingValue : '',
  withholdingTaxCode: order.withholdingTaxCode ?? '',
  memo: order.memo,
  items: order.items.map((item) => ({
    requestItemId: item.requestItemId,
    label: itemLabel(item),
    quantity: item.quantity,
    unitName: item.unitName ?? '',
    unitPrice: item.unitPrice,
    taxId: item.tax?.id ?? '',
  })),
});

export interface OrderFormErrors {
  transactionDate?: 'required';
  expectedDate?: 'beforeDate';
  vendor?: 'required';
  discount?: 'invalid';
  withholding?: 'invalid';
  itemPrices: Record<string, 'required'>;
}

const adjustmentInvalid = (type: string, value: number | '') =>
  type !== '' && (value === '' || !(value >= 0) || (type === 'percentage' && value > 100));

export const validateOrderForm = (
  values: OrderFormValues,
  options: { vendorFromQuotation: boolean }
): OrderFormErrors => {
  const errors: OrderFormErrors = { itemPrices: {} };
  if (!values.transactionDate) {
    errors.transactionDate = 'required';
  }
  if (
    values.expectedDate &&
    values.transactionDate &&
    values.expectedDate < values.transactionDate
  ) {
    errors.expectedDate = 'beforeDate';
  }
  if (!options.vendorFromQuotation && !values.vendorId) {
    errors.vendor = 'required';
  }
  if (adjustmentInvalid(values.discountType, values.discountValue)) {
    errors.discount = 'invalid';
  }
  if (adjustmentInvalid(values.withholdingType, values.withholdingValue)) {
    errors.withholding = 'invalid';
  }
  values.items.forEach((item) => {
    if (item.unitPrice === '' || !(item.unitPrice >= 0)) {
      errors.itemPrices[item.requestItemId] = 'required';
    }
  });
  return errors;
};

export const hasOrderErrors = (errors: OrderFormErrors): boolean =>
  Boolean(
    errors.transactionDate ||
    errors.expectedDate ||
    errors.vendor ||
    errors.discount ||
    errors.withholding ||
    Object.keys(errors.itemPrices).length
  );

export const orderTotalsInput = (values: OrderFormValues, taxes: TaxRef[]): TotalsInput => ({
  isPriceIncludeTax: values.isPriceIncludeTax,
  lines: values.items.map((item) => ({
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice || 0),
    taxRate: taxes.find((tax) => tax.id === item.taxId)?.rate ?? 0,
  })),
  discountType: values.discountType || null,
  discountValue: Number(values.discountValue || 0),
  withholdingType: values.withholdingType || null,
  withholdingValue: Number(values.withholdingValue || 0),
});

const optional = (value: string) => (value.trim() ? value.trim() : undefined);

const toItems = (values: OrderFormValues) =>
  values.items.map(
    (item): OrderItemInput => ({
      requestItem: item.requestItemId,
      unitPrice: Number(item.unitPrice),
      ...(item.taxId ? { tax: item.taxId } : {}),
    })
  );

const commonFields = (values: OrderFormValues, sendVendor: boolean) => ({
  transactionDate: values.transactionDate,
  expectedDate: optional(values.expectedDate),
  ...(sendVendor && values.vendorId ? { vendor: values.vendorId } : {}),
  paymentTerm: optional(values.paymentTermId),
  deliveryAddress: optional(values.deliveryAddress),
  memo: optional(values.memo),
  isPriceIncludeTax: values.isPriceIncludeTax,
  ...(values.discountType
    ? { discountType: values.discountType, discountValue: Number(values.discountValue) }
    : {}),
  ...(values.withholdingType
    ? {
        withholdingType: values.withholdingType,
        withholdingValue: Number(values.withholdingValue),
        withholdingTaxCode: optional(values.withholdingTaxCode),
      }
    : {}),
});

/** Create: a request with quotations takes its vendor from the chosen quotation. */
export const toOrderInput = (
  values: OrderFormValues,
  requestId: string,
  vendorFromQuotation: boolean
): PurchaseOrderInput => ({
  purchaseRequest: requestId,
  ...commonFields(values, !vendorFromQuotation),
  items: toItems(values),
});

/** Update: the same fields without the request, and every line also states its quantity. */
export type OrderUpdateInput = Omit<PurchaseOrderInput, 'purchaseRequest' | 'items'> & {
  items: (OrderItemInput & { quantity: number })[];
};

export const toOrderUpdateInput = (
  values: OrderFormValues,
  vendorFromQuotation: boolean
): OrderUpdateInput => ({
  ...commonFields(values, !vendorFromQuotation),
  items: toItems(values).map((item, index) => ({
    ...item,
    quantity: values.items[index].quantity,
  })),
});
