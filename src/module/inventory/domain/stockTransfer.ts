import type { BalanceReport } from '@/module/inventory/domain/stockBalance';

/** Menu id of Stock Transfer; the service answers 403 without it, the screen only hides buttons. */
export const TRANSFER_MENU = 'JP-STOCK-TRF';

export interface TransferLine {
  product: string;
  quantity: number;
}

export interface TransferInput {
  /** `YYYY-MM-DD`. */
  date: string;
  fromWarehouse: string;
  toWarehouse: string;
  memo: string;
  lines: TransferLine[];
}

export type LineIssue =
  | 'productRequired'
  | 'duplicateProduct'
  | 'quantityRequired'
  | 'overAvailable';

export interface TransferIssues {
  date?: 'dateRequired' | 'futureDate';
  from?: 'fromRequired';
  to?: 'toRequired' | 'sameWarehouse';
  noLines?: true;
  /** Issue per line index; a line without an issue is missing. */
  lines: Record<number, LineIssue>;
}

/**
 * Checks a transfer before it is sent: the date, both warehouses, and every line against what the
 * source warehouse holds. The service checks the same and also refuses a locked period or a
 * warehouse that is being counted.
 */
export const validateTransfer = (
  input: TransferInput,
  available: (productId: string) => number,
  today: string
): TransferIssues => {
  const issues: TransferIssues = { lines: {} };
  if (!input.date) issues.date = 'dateRequired';
  else if (input.date > today) issues.date = 'futureDate';
  if (!input.fromWarehouse) issues.from = 'fromRequired';
  if (!input.toWarehouse) issues.to = 'toRequired';
  else if (input.toWarehouse === input.fromWarehouse) issues.to = 'sameWarehouse';
  if (input.lines.length === 0) issues.noLines = true;

  const seen = new Set<string>();
  input.lines.forEach((line, index) => {
    if (!line.product) {
      issues.lines[index] = 'productRequired';
      return;
    }
    if (seen.has(line.product)) {
      issues.lines[index] = 'duplicateProduct';
      return;
    }
    seen.add(line.product);
    if (!(line.quantity > 0)) issues.lines[index] = 'quantityRequired';
    else if (line.quantity > available(line.product)) issues.lines[index] = 'overAvailable';
  });
  return issues;
};

/** What one warehouse holds of a product in a balance report. */
export const availableQty = (
  report: BalanceReport,
  productId: string,
  warehouseId: string
): number => report.rows.find((row) => row.productId === productId)?.quantities[warehouseId] ?? 0;

/** A line for every product the warehouse holds, each with its full quantity. */
export const fillAllLines = (report: BalanceReport, warehouseId: string): TransferLine[] =>
  report.rows
    .filter((row) => (row.quantities[warehouseId] ?? 0) > 0)
    .map((row) => ({ product: row.productId, quantity: row.quantities[warehouseId] }));

export interface TransferItem {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  unitCost: number | null;
  value: number | null;
}

export interface TransferWarehouse {
  id: string;
  code: string;
  name: string;
}

/**
 * A transfer is asked for first: stock moves only when an approver agrees. A refused one never
 * moved anything; a posted one can still be cancelled, which moves the stock back.
 */
export type TransferStatus = 'pending' | 'posted' | 'rejected' | 'void';

/**
 * The service prices a transfer when it is approved. Before that, and after a refusal, its lines
 * carry a cost and value of 0, which would read as a real "Rp 0,00", so the screen shows no value.
 */
export const isTransferValued = (status: TransferStatus): boolean =>
  status === 'posted' || status === 'void';

export interface StockTransfer {
  id: string;
  number: string;
  date: string;
  from: TransferWarehouse;
  to: TransferWarehouse;
  items: TransferItem[];
  productCount: number;
  memo: string;
  status: TransferStatus;
  /** True when the signed-in person is one of the approvers who can still decide it. */
  canDecide: boolean;
  createdByName: string;
  /** Role names whose approval is still awaited, each listed once. */
  waitingFor: string[];
  rejectedByName: string | null;
  rejectReason: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  createdAt: string;
}
