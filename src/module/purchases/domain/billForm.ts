import type {
  BillHeaderInput,
  BillUpdateInput,
  DiscountKind,
  ManualBillItemInput,
  PurchaseBillInput,
} from '@/module/purchases/domain/purchaseInputs';
import type {
  BillSource,
  BillVariance,
  PurchaseBill,
} from '@/module/purchases/domain/purchaseDocuments';
import {
  billItemsFor,
  type BillQuantities,
  type BillSourceDoc,
} from '@/module/purchases/domain/billSources';

/** Same tolerance the backend applies when it compares the vendor's invoice total (Rp1). */
export const TOTAL_TOLERANCE = 1;

export type AdjustmentKind = 'none' | DiscountKind;

export interface ManualLine {
  /** Local key so rows keep their identity while editing. */
  key: string;
  productId: string;
  productName: string;
  accountId: string;
  description: string;
  quantity: number | '';
  unitPrice: number | '';
  taxId: string;
}

export interface BillFormValues {
  date: string;
  vendorInvoiceNumber: string;
  taxInvoiceNumber: string;
  vendorInvoiceTotal: number | '';
  /** Blank lets the service work it out from the payment term. */
  dueDate: string;
  discountKind: AdjustmentKind;
  discountValue: number | '';
  withholdingKind: AdjustmentKind;
  withholdingValue: number | '';
  withholdingTaxCode: string;
  tagIds: string[];
  memo: string;
  /** Manual bills only. */
  vendorId: string;
  vendorName: string;
  lines: ManualLine[];
}

export type BillFormIssue =
  | 'dateRequired'
  | 'dueBeforeDate'
  | 'discountPercent'
  | 'discountNegative'
  | 'discountTooHigh'
  | 'withholdingPercent'
  | 'withholdingNegative'
  | 'invoiceTotalNegative'
  | 'vendorRequired'
  | 'linesEmpty';

export interface BillFormErrors {
  fields: Partial<Record<keyof BillFormValues, BillFormIssue>>;
  /** By line key. */
  lines: Record<
    string,
    { target?: 'targetRequired'; quantity?: 'quantityPositive'; unitPrice?: 'pricePositive' }
  >;
}

let counter = 0;
export const newLineKey = (): string => {
  counter += 1;
  return `line-${counter}`;
};

export const emptyManualLine = (): ManualLine => ({
  key: newLineKey(),
  productId: '',
  productName: '',
  accountId: '',
  description: '',
  quantity: 1,
  unitPrice: '',
  taxId: '',
});

export const emptyBillForm = (today: string): BillFormValues => ({
  date: today,
  vendorInvoiceNumber: '',
  taxInvoiceNumber: '',
  vendorInvoiceTotal: '',
  dueDate: '',
  discountKind: 'none',
  discountValue: '',
  withholdingKind: 'none',
  withholdingValue: '',
  withholdingTaxCode: '',
  tagIds: [],
  memo: '',
  vendorId: '',
  vendorName: '',
  lines: [emptyManualLine()],
});

/** A saved draft opened for editing: only the header can change. */
export const billToForm = (bill: PurchaseBill, tagIds: string[] = bill.tags): BillFormValues => ({
  ...emptyBillForm(bill.date),
  vendorInvoiceNumber: bill.vendorInvoiceNumber,
  taxInvoiceNumber: bill.taxInvoiceNumber,
  vendorInvoiceTotal: bill.vendorInvoiceTotal ?? '',
  dueDate: bill.dueDate ?? '',
  discountKind: bill.discountType ?? 'none',
  discountValue: bill.discountType ? bill.discountValue : '',
  withholdingKind: bill.withholdingType ?? 'none',
  withholdingValue: bill.withholdingType ? bill.withholdingValue : '',
  withholdingTaxCode: bill.withholdingTaxCode ?? '',
  tagIds,
  memo: bill.memo,
  vendorId: bill.vendor.id,
  vendorName: bill.vendor.name,
  lines: [],
});

const isNumber = (value: number | ''): value is number => value !== '' && Number.isFinite(value);

/**
 * The service accepts a percentage above 100, a discount above the bill (its total becomes 0) and a due
 * date before the bill date; the form does not. `subtotal` is known only when a saved draft is edited, and
 * then only the header is checked (`headerOnly`): the lines of a saved bill are not on the form.
 */
export const validateBillForm = (
  values: BillFormValues,
  source: BillSource,
  options: { subtotal?: number; headerOnly?: boolean } = {}
): BillFormErrors => {
  const { subtotal, headerOnly = false } = options;
  const fields: BillFormErrors['fields'] = {};
  const lines: BillFormErrors['lines'] = {};
  if (!values.date) fields.date = 'dateRequired';
  else if (source === 'MANUAL' && values.dueDate && values.dueDate < values.date) {
    fields.dueDate = 'dueBeforeDate';
  }
  if (source === 'MANUAL' && values.discountKind !== 'none') {
    const value = isNumber(values.discountValue) ? values.discountValue : 0;
    if (value < 0) {
      fields.discountValue = 'discountNegative';
    } else if (values.discountKind === 'percentage' && value > 100) {
      fields.discountValue = 'discountPercent';
    } else if (values.discountKind === 'nominal' && subtotal !== undefined && value > subtotal) {
      fields.discountValue = 'discountTooHigh';
    }
  }
  if (values.withholdingKind !== 'none') {
    const value = isNumber(values.withholdingValue) ? values.withholdingValue : 0;
    if (value < 0) fields.withholdingValue = 'withholdingNegative';
    else if (values.withholdingKind === 'percentage' && value > 100) {
      fields.withholdingValue = 'withholdingPercent';
    }
  }
  if (isNumber(values.vendorInvoiceTotal) && values.vendorInvoiceTotal < 0) {
    fields.vendorInvoiceTotal = 'invoiceTotalNegative';
  }
  if (source === 'MANUAL' && !headerOnly) {
    if (!values.vendorId) fields.vendorId = 'vendorRequired';
    if (values.lines.length === 0) fields.lines = 'linesEmpty';
    values.lines.forEach((line) => {
      const row: BillFormErrors['lines'][string] = {};
      if (!line.productId && !line.accountId) row.target = 'targetRequired';
      if (!isNumber(line.quantity) || line.quantity <= 0) row.quantity = 'quantityPositive';
      if (!isNumber(line.unitPrice) || line.unitPrice <= 0) row.unitPrice = 'pricePositive';
      if (Object.keys(row).length > 0) lines[line.key] = row;
    });
  }
  return { fields, lines };
};

export const hasBillErrors = (errors: BillFormErrors): boolean =>
  Object.keys(errors.fields).length > 0 || Object.keys(errors.lines).length > 0;

const adjustment = (kind: AdjustmentKind, value: number | '') =>
  kind === 'none' || !isNumber(value) ? {} : { kind, value };

const header = (values: BillFormValues): BillHeaderInput => {
  const discount = adjustment(values.discountKind, values.discountValue);
  const withholding = adjustment(values.withholdingKind, values.withholdingValue);
  return {
    transactionDate: values.date,
    ...(values.vendorInvoiceNumber.trim()
      ? { vendorInvoiceNumber: values.vendorInvoiceNumber.trim() }
      : {}),
    ...(values.taxInvoiceNumber.trim() ? { taxInvoiceNumber: values.taxInvoiceNumber.trim() } : {}),
    ...(isNumber(values.vendorInvoiceTotal)
      ? { vendorInvoiceTotal: values.vendorInvoiceTotal }
      : {}),
    ...(values.dueDate ? { dueDate: values.dueDate } : {}),
    ...(discount.kind ? { discountType: discount.kind, discountValue: discount.value } : {}),
    ...(withholding.kind
      ? { withholdingType: withholding.kind, withholdingValue: withholding.value }
      : {}),
    ...(withholding.kind && values.withholdingTaxCode.trim()
      ? { withholdingTaxCode: values.withholdingTaxCode.trim() }
      : {}),
    ...(values.tagIds.length > 0 ? { tags: values.tagIds } : {}),
    ...(values.memo.trim() ? { memo: values.memo.trim() } : {}),
  };
};

const manualItems = (lines: ManualLine[]): ManualBillItemInput[] =>
  lines.map((line) => ({
    ...(line.productId ? { product: line.productId } : {}),
    ...(!line.productId && line.accountId ? { account: line.accountId } : {}),
    description: line.description.trim(),
    quantity: Number(line.quantity),
    unitPrice: Number(line.unitPrice),
    ...(line.taxId ? { tax: line.taxId } : {}),
  }));

/** The create body for the chosen source. `post` creates the bill already verified. */
export const toBillInput = (
  source: BillSource,
  values: BillFormValues,
  picked: BillSourceDoc[],
  post: boolean,
  quantities: BillQuantities = {}
): PurchaseBillInput => {
  const formHeader = header(values);
  const { vendorInvoiceTotal, discountType, discountValue, dueDate, ...orderHeader } = formHeader;
  const base = {
    ...(source === 'MANUAL' ? formHeader : orderHeader),
    ...(post ? { post: true } : {}),
  };
  if (source === 'MANUAL') {
    return { ...base, source, vendor: values.vendorId, items: manualItems(values.lines) };
  }
  // A line billed in part is sent with its quantity; otherwise the service takes whole documents.
  const items = billItemsFor(source, picked, quantities);
  if (items) return { ...base, source, items };
  const ids = picked.map((doc) => doc.id);
  return source === 'RECEIPT'
    ? { ...base, source, goodsReceipts: ids }
    : { ...base, source, purchaseOrders: ids };
};

/** Preview includes the vendor total for comparison; a saved PO bill never stores that amount. */
export const toBillPreviewInput = (
  source: BillSource,
  values: BillFormValues,
  picked: BillSourceDoc[],
  post: boolean,
  quantities: BillQuantities = {}
): PurchaseBillInput => {
  const input = toBillInput(source, values, picked, post, quantities);
  if (source === 'MANUAL' || !isNumber(values.vendorInvoiceTotal)) return input;
  return { ...input, vendorInvoiceTotal: values.vendorInvoiceTotal };
};

/** The update body: every header field, cleared ones empty, so a PUT replaces what the person emptied. */
export const toBillUpdate = (
  values: BillFormValues,
  source: BillSource = 'MANUAL'
): BillUpdateInput => ({
  transactionDate: values.date,
  vendorInvoiceNumber: values.vendorInvoiceNumber.trim(),
  taxInvoiceNumber: values.taxInvoiceNumber.trim(),
  ...(source === 'MANUAL' && isNumber(values.vendorInvoiceTotal)
    ? { vendorInvoiceTotal: values.vendorInvoiceTotal }
    : {}),
  ...(source === 'MANUAL' && values.dueDate ? { dueDate: values.dueDate } : {}),
  ...(source === 'MANUAL'
    ? {
        discountType: values.discountKind === 'none' ? null : values.discountKind,
        discountValue:
          values.discountKind === 'none' || !isNumber(values.discountValue)
            ? 0
            : values.discountValue,
      }
    : {}),
  withholdingType: values.withholdingKind === 'none' ? null : values.withholdingKind,
  withholdingValue:
    values.withholdingKind === 'none' || !isNumber(values.withholdingValue)
      ? 0
      : values.withholdingValue,
  withholdingTaxCode: values.withholdingKind === 'none' ? '' : values.withholdingTaxCode.trim(),
  tags: values.tagIds,
  memo: values.memo.trim(),
});

/** The differences a refused verification lists (`type` TOTAL or PRICE, with what was expected and found). */
export const readVariances = (details: unknown[]): BillVariance[] =>
  details.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const { type, expected, actual } = item as Record<string, unknown>;
    return (type === 'TOTAL' || type === 'PRICE') &&
      typeof expected === 'number' &&
      typeof actual === 'number'
      ? [{ type, expected, actual }]
      : [];
  });
