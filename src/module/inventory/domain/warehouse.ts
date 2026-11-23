/** Menu id of Stock & Warehouse; the service answers 403 without it, the screen only hides buttons. */
export const WAREHOUSE_MENU = 'JP-STOCK';

/** Lengths the service accepts; a longer value is refused with a 400. */
export const WAREHOUSE_LIMITS = { code: 20, name: 100 } as const;

export interface PersonRef {
  id: string;
  name: string;
}

export interface OpnameRef {
  id: string;
  number: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string;
  picUser: PersonRef | null;
  isDefault: boolean;
  isActive: boolean;
  /** The count that freezes this warehouse now, if any. */
  runningOpname: OpnameRef | null;
  /** The last posted count; only on the detail. */
  lastOpname: (OpnameRef & { date: string }) | null;
  itemCount: number;
  /** Null when the service does not send values to this person. */
  inventoryValue: number | null;
  /** Products under their minimum here; only the detail carries it. */
  belowMinCount: number;
  /** True only for a warehouse that no document has ever used. */
  canDelete: boolean;
  /** The code cannot change once the warehouse has been used. */
  codeLocked: boolean;
  createdAt: string;
  createdBy: PersonRef | null;
}

export interface WarehouseInput {
  code: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  picUserId: string | null;
  phone: string;
  notes: string;
  isDefault: boolean;
}

export type StockStatus = 'safe' | 'belowMin' | 'empty';

export interface WarehouseStockItem {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  minQty: number;
  status: StockStatus;
  avgCost: number | null;
  value: number | null;
}

/** Empty at zero; below the minimum only when a minimum is set; safe otherwise. */
export const stockStatus = (qty: number, minQty: number): StockStatus => {
  if (qty <= 0) return 'empty';
  return minQty > 0 && qty < minQty ? 'belowMin' : 'safe';
};

export interface AuditChange {
  field: string;
  from: string | null;
  to: string | null;
}

export interface AuditEntry {
  id: string;
  at: string;
  action: string;
  userName: string;
  changes: AuditChange[];
}

export interface WarehouseSummary {
  totalCount: number;
  activeCount: number;
  itemCount: number;
  /** Null when the service does not send values to this person. */
  inventoryValue: number | null;
}

/**
 * Why a warehouse cannot be switched off yet; the service sends all of them at once. A reason the
 * screen does not know keeps the service's own sentence (Indonesian) as `other`.
 */
export type BlockReason =
  | { kind: 'default' }
  | { kind: 'stock'; itemCount: number | null; value: number | null }
  | { kind: 'orders'; count: number | null }
  | { kind: 'transfers'; count: number | null; transfers: { id: string; number: string }[] }
  | { kind: 'opname'; number: string; id: string }
  | { kind: 'other'; message: string };

const BLOCK_ORDER: BlockReason['kind'][] = [
  'default',
  'stock',
  'orders',
  'transfers',
  'opname',
  'other',
];

export const sortBlockReasons = (reasons: BlockReason[]): BlockReason[] =>
  [...reasons].sort((a, b) => BLOCK_ORDER.indexOf(a.kind) - BLOCK_ORDER.indexOf(b.kind));

/**
 * What already stops a deactivation from the warehouse's own figures, so the dialog can say so
 * without asking the service. Open purchase orders and transfers waiting for approval are only
 * known to the service.
 */
export const knownBlockers = (warehouse: Warehouse): BlockReason[] => {
  const reasons: BlockReason[] = [];
  if (warehouse.isDefault) reasons.push({ kind: 'default' });
  if (warehouse.itemCount > 0) {
    reasons.push({
      kind: 'stock',
      itemCount: warehouse.itemCount,
      value: warehouse.inventoryValue,
    });
  }
  if (warehouse.runningOpname) {
    reasons.push({
      kind: 'opname',
      number: warehouse.runningOpname.number,
      id: warehouse.runningOpname.id,
    });
  }
  return sortBlockReasons(reasons);
};

export type WarehouseIssue =
  | 'codeRequired'
  | 'codeInvalid'
  | 'nameRequired'
  | 'nameTooLong'
  | 'phoneInvalid';

export type WarehouseIssues = Partial<Record<'code' | 'name' | 'phone', WarehouseIssue>>;

const CODE_PATTERN = /^[A-Za-z0-9-]+$/;
const PHONE_PATTERN = /^[0-9+\-\s]+$/;

export const emptyWarehouseInput = (): WarehouseInput => ({
  code: '',
  name: '',
  address: '',
  city: '',
  postalCode: '',
  picUserId: null,
  phone: '',
  notes: '',
  isDefault: false,
});

export const toWarehouseInput = (warehouse: Warehouse): WarehouseInput => ({
  code: warehouse.code,
  name: warehouse.name,
  address: warehouse.address,
  city: warehouse.city,
  postalCode: warehouse.postalCode,
  picUserId: warehouse.picUser?.id ?? null,
  phone: warehouse.phone,
  notes: warehouse.notes,
  isDefault: warehouse.isDefault,
});

/** Checks the entry the way the service does, on trimmed values. */
export const validateWarehouse = (
  input: WarehouseInput,
  options: { codeOptional?: boolean } = {}
): WarehouseIssues => {
  const issues: WarehouseIssues = {};
  const code = input.code.trim();
  if (!code) {
    if (!options.codeOptional) issues.code = 'codeRequired';
  } else if (code.length > WAREHOUSE_LIMITS.code || !CODE_PATTERN.test(code)) {
    issues.code = 'codeInvalid';
  }
  const name = input.name.trim();
  if (!name) issues.name = 'nameRequired';
  else if (name.length > WAREHOUSE_LIMITS.name) issues.name = 'nameTooLong';
  const phone = input.phone.trim();
  if (phone && !PHONE_PATTERN.test(phone)) issues.phone = 'phoneInvalid';
  return issues;
};

/** The request body: trimmed text, so a name of spaces never reaches the service. */
export const toWarehousePayload = (input: WarehouseInput): WarehouseInput => ({
  code: input.code.trim(),
  name: input.name.trim(),
  address: input.address.trim(),
  city: input.city.trim(),
  postalCode: input.postalCode.trim(),
  picUserId: input.picUserId,
  phone: input.phone.trim(),
  notes: input.notes.trim(),
  isDefault: input.isDefault,
});
