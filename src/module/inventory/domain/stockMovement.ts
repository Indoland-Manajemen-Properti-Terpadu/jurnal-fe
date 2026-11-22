export interface CostBreakdown {
  dpp: number;
  freight: number;
  vat: number;
}

export interface MovementWarehouse {
  id: string;
  code: string;
  name: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: string;
  typeLabel: string;
  isReversal: boolean;
  documentNumber: string;
  sourceType: string;
  sourceId: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  warehouse: MovementWarehouse;
  quantityIn: number;
  quantityOut: number;
  /** Null when the service does not send values to this person. */
  unitCost: number | null;
  value: number | null;
  /** The journal the movement posted, if any (a transfer posts none). */
  journalId: string | null;
  costBreakdown: CostBreakdown | null;
}

export interface MovementTotals {
  count: number;
  inQty: number;
  outQty: number;
  inValue: number | null;
  outValue: number | null;
}

/** The movement types the service knows, in the order the filter lists them. */
export const MOVEMENT_TYPES = [
  'OPENING',
  'RECEIPT',
  'PURCHASE_RETURN',
  'SALE',
  'SALE_RETURN',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'OPNAME_GAIN',
  'OPNAME_LOSS',
  'REVERSAL',
] as const;

export type DocumentKind = 'purchaseReceipt' | 'transfer' | 'opname';

export interface DocumentTarget {
  kind: DocumentKind;
  id: string;
}

const SOURCE_KIND: Record<string, DocumentKind> = {
  GoodsReceipt: 'purchaseReceipt',
  StockTransfer: 'transfer',
  StockOpname: 'opname',
};

/** Which kind of document a movement came from; null for a source the screen does not know. */
export const documentTarget = (sourceType: string, sourceId: string): DocumentTarget | null => {
  const kind = SOURCE_KIND[sourceType];
  return kind && sourceId ? { kind, id: sourceId } : null;
};

/** The price is worth explaining only when freight or tax is part of it. */
export const hasCostBreakdown = (breakdown: CostBreakdown | null): breakdown is CostBreakdown =>
  breakdown !== null && (breakdown.freight > 0 || breakdown.vat > 0);
