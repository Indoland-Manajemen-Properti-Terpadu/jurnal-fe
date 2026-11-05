import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import type { PurchaseRequest, Quotation } from '@/module/purchases/domain/purchaseDocuments';
import type { QuotationInput } from '@/module/purchases/domain/purchaseInputs';
import { newItemKey } from '@/module/purchases/domain/requestForm';

export interface QuotationFormValues {
  key: string;
  vendorId: string;
  vendorName: string;
  number: string;
  date: string;
  validUntil: string;
  notes: string;
  /** Unit price per request item id; blank until typed. */
  prices: Record<string, number | ''>;
}

export const emptyQuotation = (request: PurchaseRequest, today: string): QuotationFormValues => ({
  key: newItemKey(),
  vendorId: '',
  vendorName: '',
  number: '',
  date: today,
  validUntil: '',
  notes: '',
  prices: Object.fromEntries(request.items.map((item) => [item.id, ''])),
});

export const quotationToForm = (quotation: Quotation): QuotationFormValues => ({
  key: quotation.id,
  vendorId: quotation.vendor.id,
  vendorName: quotation.vendor.name,
  number: quotation.number,
  date: quotation.date,
  validUntil: quotation.validUntil ?? '',
  notes: quotation.notes,
  prices: Object.fromEntries(quotation.items.map((item) => [item.requestItemId, item.unitPrice])),
});

export type QuotationErrors = {
  vendor?: 'required';
  date?: 'required';
  validUntil?: 'beforeDate';
  prices?: 'missing';
};

export const validateQuotation = (
  values: QuotationFormValues,
  request: PurchaseRequest,
  otherVendorIds: string[]
): QuotationErrors & { duplicateVendor?: boolean } => {
  const errors: QuotationErrors & { duplicateVendor?: boolean } = {};
  if (!values.vendorId) errors.vendor = 'required';
  else if (otherVendorIds.includes(values.vendorId)) errors.duplicateVendor = true;
  if (!values.date) errors.date = 'required';
  if (values.validUntil && values.date && values.validUntil < values.date) {
    errors.validUntil = 'beforeDate';
  }
  const missing = request.items.some((item) => {
    const price = values.prices[item.id];
    return price === '' || price === undefined || !(price >= 0);
  });
  if (missing) errors.prices = 'missing';
  return errors;
};

export const hasQuotationErrors = (errors: ReturnType<typeof validateQuotation>): boolean =>
  Object.keys(errors).length > 0;

export const toQuotationInput = (
  values: QuotationFormValues,
  request: PurchaseRequest
): QuotationInput => ({
  vendor: values.vendorId,
  ...(values.number.trim() ? { quotationNumber: values.number.trim() } : {}),
  quotationDate: values.date,
  ...(values.validUntil ? { validUntil: values.validUntil } : {}),
  ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
  items: request.items.map((item) => ({
    requestItem: item.id,
    quantity: item.quantity,
    unitPrice: Number(values.prices[item.id]),
  })),
});

/** The server replaces the whole list, so a save always sends every quotation. */
export const toQuotationInputs = (
  all: QuotationFormValues[],
  request: PurchaseRequest
): QuotationInput[] => all.map((values) => toQuotationInput(values, request));

export const quotationTotal = (quantities: number[], prices: (number | '')[]): number =>
  Number(
    fromMinor(
      sumMinor(
        quantities.map((qty, index) => Math.round(qty * toMinor(Number(prices[index] || 0))))
      )
    )
  );

/** Id of the quotation with the lowest total; null when there is no unique cheapest one. */
export const lowestQuotationId = (quotations: Quotation[]): string | null => {
  if (quotations.length < 2) return null;
  const sorted = [...quotations].sort((a, b) => a.total - b.total);
  return sorted[0].total < sorted[1].total ? sorted[0].id : null;
};

export const isQuotationExpired = (quotation: Quotation, today: string): boolean =>
  quotation.validUntil !== null && quotation.validUntil < today;
