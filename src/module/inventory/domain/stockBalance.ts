export interface BalanceWarehouse {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface BalanceRow {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  /** Quantity per warehouse id; a warehouse that holds none is missing. */
  quantities: Record<string, number>;
  totalQty: number;
  /** Null when the service does not send values to this person. */
  avgCost: number | null;
  value: number | null;
}

export interface Reconciliation {
  matches: boolean;
  stockValue: number;
  ledgerValue: number;
}

export interface BalanceSummary {
  inventoryValue: number | null;
  trackedProducts: number;
  belowMinCount: number;
  emptyCount: number;
}

export interface BalanceReport {
  asOf: string;
  warehouses: BalanceWarehouse[];
  rows: BalanceRow[];
  summary: BalanceSummary;
  reconciliation: Reconciliation | null;
}

/** How far the stock value is from the ledger, as a positive amount; null without a reconciliation. */
export const reconciliationGap = (report: BalanceReport): number | null => {
  if (!report.reconciliation) return null;
  const { stockValue, ledgerValue } = report.reconciliation;
  return Math.round(Math.abs(ledgerValue - stockValue) * 100) / 100;
};

/** Active warehouses, plus inactive ones that still held stock on the date shown. */
export const visibleWarehouses = (report: BalanceReport): BalanceWarehouse[] =>
  report.warehouses.filter(
    (warehouse) =>
      warehouse.isActive || report.rows.some((row) => (row.quantities[warehouse.id] ?? 0) !== 0)
  );
