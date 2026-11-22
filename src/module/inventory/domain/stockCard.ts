import type { MovementWarehouse } from '@/module/inventory/domain/stockMovement';

export interface CardProduct {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string;
}

export interface CardBalance {
  quantity: number;
  /** Null when the service does not send values to this person. */
  value: number | null;
}

export interface StockCardRow {
  id: string;
  date: string;
  type: string;
  typeLabel: string;
  isReversal: boolean;
  documentNumber: string;
  sourceType: string;
  sourceId: string;
  warehouse: MovementWarehouse;
  quantityIn: number;
  quantityOut: number;
  balanceQty: number;
  unitCost: number | null;
  value: number | null;
  balanceValue: number | null;
  avgCost: number | null;
  journalId: string | null;
}

export interface StockCard {
  product: CardProduct;
  /** Null for "all warehouses". */
  warehouse: MovementWarehouse | null;
  from: string | null;
  to: string | null;
  /** A transfer between warehouses nets to zero overall, so it is left out of the totals. */
  transfersExcluded: boolean;
  opening: CardBalance;
  closing: CardBalance;
  totalIn: number;
  totalOut: number;
  rows: StockCardRow[];
}
