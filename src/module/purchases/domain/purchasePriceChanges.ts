import type { ApprovalState } from '@/module/purchases/domain/purchaseCommon';

export interface PriceChangeOrderItem {
  id: string;
  description: string;
  quantity: number;
  billedQty: number;
  unitPrice: number;
}

export interface OpenPriceChangeItem {
  purchaseOrderItem: string;
  description: string;
  openQty: number;
  oldUnitPrice: number;
}

export interface PriceChangeFormValues {
  proposedPrices: Record<string, number | ''>;
  reason: string;
  vendorInvoiceNumber: string;
  vendorInvoiceTotal: number | '';
}

export interface PriceChangeInput {
  items: { purchaseOrderItem: string; newUnitPrice: number }[];
  reason: string;
  vendorInvoiceNumber?: string;
  vendorInvoiceTotal: number;
}

export interface PriceChangeFormErrors {
  reason?: 'required' | 'tooLong';
  vendorInvoiceNumber?: 'tooLong';
  vendorInvoiceTotal?: 'required' | 'invalid';
  itemPrices?: 'invalid';
  items?: 'noChanges';
}

export const openPriceChangeItems = (items: PriceChangeOrderItem[]): OpenPriceChangeItem[] => {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    const openQty = Math.max(0, item.quantity - item.billedQty);
    if (openQty === 0 || seen.has(item.id)) return [];
    seen.add(item.id);
    return [
      {
        purchaseOrderItem: item.id,
        description: item.description,
        openQty,
        oldUnitPrice: item.unitPrice,
      },
    ];
  });
};

export const buildPriceChangeInput = (
  orderItems: PriceChangeOrderItem[],
  values: PriceChangeFormValues
): PriceChangeInput => {
  const items = openPriceChangeItems(orderItems).flatMap((item) => {
    const newUnitPrice = values.proposedPrices[item.purchaseOrderItem];
    if (
      newUnitPrice === undefined ||
      newUnitPrice === '' ||
      !Number.isFinite(newUnitPrice) ||
      newUnitPrice < 0 ||
      newUnitPrice === item.oldUnitPrice
    ) {
      return [];
    }
    return [{ purchaseOrderItem: item.purchaseOrderItem, newUnitPrice }];
  });

  const vendorInvoiceNumber = values.vendorInvoiceNumber.trim();
  return {
    items,
    reason: values.reason.trim(),
    ...(vendorInvoiceNumber ? { vendorInvoiceNumber } : {}),
    vendorInvoiceTotal: values.vendorInvoiceTotal === '' ? 0 : values.vendorInvoiceTotal,
  };
};

export const validatePriceChangeForm = (
  values: PriceChangeFormValues,
  items: OpenPriceChangeItem[]
): PriceChangeFormErrors => {
  const errors: PriceChangeFormErrors = {};
  if (!values.reason.trim()) errors.reason = 'required';
  else if (values.reason.trim().length > 2_000) errors.reason = 'tooLong';

  if (values.vendorInvoiceNumber.trim().length > 100) errors.vendorInvoiceNumber = 'tooLong';
  if (values.vendorInvoiceTotal === '') errors.vendorInvoiceTotal = 'required';
  else if (!Number.isFinite(values.vendorInvoiceTotal) || values.vendorInvoiceTotal < 0) {
    errors.vendorInvoiceTotal = 'invalid';
  }

  const itemPrices = items.flatMap((item) => {
    const price = values.proposedPrices[item.purchaseOrderItem];
    return price !== undefined && price !== '' && (!Number.isFinite(price) || price < 0)
      ? [price]
      : [];
  });
  if (itemPrices.length > 0) errors.itemPrices = 'invalid';

  if (buildPriceChangeInput(itemsToOrderItems(items), values).items.length === 0) {
    errors.items = 'noChanges';
  }
  return errors;
};

const itemsToOrderItems = (items: OpenPriceChangeItem[]): PriceChangeOrderItem[] =>
  items.map((item) => ({
    id: item.purchaseOrderItem,
    description: item.description,
    quantity: item.openQty,
    billedQty: 0,
    unitPrice: item.oldUnitPrice,
  }));

const roundedIntegerAtPrecision = (value: number, precision: number): bigint | null => {
  if (!Number.isFinite(value)) return null;
  const [mantissa, exponentText] = value.toString().toLowerCase().split('e');
  const exponent = Number(exponentText ?? 0);
  const negative = mantissa.startsWith('-');
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const [whole, fraction = ''] = unsigned.split('.');
  const digits = BigInt(`${whole}${fraction}`);
  const shift = precision - (fraction.length - exponent);
  let rounded: bigint;
  if (shift >= 0) {
    rounded = digits * 10n ** BigInt(shift);
  } else {
    const divisor = 10n ** BigInt(-shift);
    const quotient = digits / divisor;
    const remainder = digits % divisor;
    rounded = quotient + (remainder * 2n >= divisor ? 1n : 0n);
  }
  return negative ? -rounded : rounded;
};

/** Compares totals only at the precision returned by the server's preview. */
export const compareInvoiceTotal = (
  vendorTotal: number | '',
  previewTotal: number,
  precision: number
): boolean | null => {
  if (
    vendorTotal === '' ||
    !Number.isFinite(vendorTotal) ||
    !Number.isFinite(previewTotal) ||
    !Number.isInteger(precision) ||
    precision < 0 ||
    precision > 4
  ) {
    return null;
  }
  const vendorRounded = roundedIntegerAtPrecision(vendorTotal, precision);
  const previewRounded = roundedIntegerAtPrecision(previewTotal, precision);
  return vendorRounded !== null && previewRounded !== null && vendorRounded === previewRounded;
};

export interface PriceChangeRequestItem {
  purchaseOrderItemId: string;
  description: string;
  oldUnitPrice: number;
  newUnitPrice: number;
}

export interface PriceChangeRequest extends ApprovalState {
  id: string;
  status: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  reason: string;
  vendorInvoiceNumber: string;
  vendorInvoiceTotal: number | null;
  items: PriceChangeRequestItem[];
  approvalStage: number | null;
}
