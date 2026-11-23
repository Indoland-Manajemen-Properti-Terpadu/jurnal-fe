import type { StockStatus } from '@/module/inventory/domain/warehouse';

export interface ProductStockWarehouse {
  warehouseId: string;
  code: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  quantity: number;
  /** Zero when no minimum is set for this product in this warehouse. */
  minQty: number;
  status: StockStatus;
  /** The last stock count that covered this product here; null when none did. */
  lastOpname: { id: string; number: string; date: string } | null;
}

/** One product's stock in every warehouse. The service sends no money figures for it. */
export interface ProductStock {
  productId: string;
  unit: string;
  totalQty: number;
  warehouses: ProductStockWarehouse[];
}

/**
 * The service names the state in its own words ("aman", "di_bawah_minimum", "habis") and flags `belowMin`; an empty
 * warehouse is never reported as "below minimum", because empty is the stronger signal.
 */
export const productStockStatus = (row: {
  quantity: number;
  belowMin: boolean;
  status: string;
}): StockStatus => {
  if (row.quantity <= 0 || row.status === 'habis') return 'empty';
  return row.belowMin || row.status === 'di_bawah_minimum' ? 'belowMin' : 'safe';
};
