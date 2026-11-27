export interface BillPreview {
  /** DPP: the amount before tax, after any discount. */
  taxBase: number;
  taxAmount: number;
  /** The comparable total, or null if the service did not return it. */
  total: number | null;
  withholdingAmount: number;
  /** What the bill adds to payables. */
  finalAmount: number;
  dueDate: string | null;
  /** Decimal places the server uses when comparing the vendor invoice total. */
  precision: number | null;
  priceChangePending: boolean;
  pendingPriceChange: {
    id: string;
    purchaseOrderId: string;
    purchaseOrderNumber: string;
  } | null;
}

export interface BillPreviewDto {
  taxBase?: number | null;
  taxAmount?: number | null;
  total?: number | null;
  withholdingAmount?: number | null;
  finalAmount?: number | null;
  dueDate?: string | null;
  precision?: number | null;
  priceChangePending?: boolean | null;
  pendingPriceChange?: {
    id: string;
    purchaseOrder:
      | string
      | { id: string; transactionNumber?: string | null; number?: string | null }
      | null;
  } | null;
}

const finiteOrNull = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const pendingPriceChangeRef = (dto: BillPreviewDto['pendingPriceChange']) => {
  if (!dto) return null;
  const order = dto.purchaseOrder;
  const purchaseOrderId = typeof order === 'string' ? order : (order?.id ?? '');
  if (!purchaseOrderId) return null;
  return {
    id: dto.id,
    purchaseOrderId,
    purchaseOrderNumber:
      typeof order === 'string' ? '' : (order?.transactionNumber ?? order?.number ?? ''),
  };
};

export const toBillPreview = (dto: BillPreviewDto): BillPreview => {
  const total = finiteOrNull(dto.total);
  const rawPrecision = dto.precision;
  const precision =
    typeof rawPrecision === 'number' &&
    Number.isInteger(rawPrecision) &&
    rawPrecision >= 0 &&
    rawPrecision <= 4
      ? rawPrecision
      : null;
  const pendingPriceChange = pendingPriceChangeRef(dto.pendingPriceChange);
  return {
    taxBase: finiteOrNull(dto.taxBase) ?? 0,
    taxAmount: finiteOrNull(dto.taxAmount) ?? 0,
    total,
    withholdingAmount: finiteOrNull(dto.withholdingAmount) ?? 0,
    finalAmount: finiteOrNull(dto.finalAmount) ?? total ?? 0,
    dueDate: dto.dueDate ? dto.dueDate.slice(0, 10) : null,
    precision,
    priceChangePending: dto.priceChangePending ?? Boolean(dto.pendingPriceChange),
    pendingPriceChange,
  };
};
