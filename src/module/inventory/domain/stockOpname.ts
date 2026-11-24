/** Menu ids of Stock Count; the service answers 403 without them, the screen only hides buttons. */
export const OPNAME_MENU = {
  /** Warehouse staff: create, start, enter counts (blind). */
  count: 'JP-STOCK-OPN',
  /** Accounting: sees values, gives reasons, submits, cancels. */
  review: 'JP-STOCK-OPN-REV',
  /** Building Manager: approves or rejects. */
  approve: 'JP-STOCK-OPN-APR',
} as const;

export type OpnameStatus = 'draft' | 'counting' | 'pending_approval' | 'posted' | 'cancelled';

export type OpnameReason =
  | 'rusak'
  | 'kedaluwarsa'
  | 'hilang'
  | 'salah_catat'
  | 'ditemukan'
  | 'lainnya';

export interface OpnameWarehouse {
  id: string;
  code: string;
  name: string;
}

export interface OpnameLine {
  id: string;
  productId: string;
  name: string;
  sku: string;
  unit: string;
  /** Null for a person who counts blind: the book balance is never sent to them. */
  bookQty: number | null;
  /** Null until the line is counted; zero is a count. */
  countedQty: number | null;
  diffQty: number | null;
  unitCost: number | null;
  /** True for a product with no price yet, so Accounting gives one for what is found. */
  costEditable: boolean;
  diffValue: number | null;
  reason: OpnameReason | null;
  allowedReasons: OpnameReason[];
  note: string;
  /** Added during the count because it was on the shelf but not on the list. */
  isFound: boolean;
  needsRecount: boolean;
}

export interface OpnameSummary {
  counted: number;
  total: number;
  withDiff: number;
  gainQty: number;
  lossQty: number;
  gainValue: number | null;
  lossValue: number | null;
  netValue: number | null;
}

export interface OpnameHistoryEntry {
  at: string;
  action: string;
  note: string;
  userName: string;
}

export interface OpnameScope {
  type: 'all' | 'category' | 'manual';
  categoryIds: string[];
  productIds: string[];
}

export interface StockOpname {
  id: string;
  number: string;
  status: OpnameStatus;
  date: string;
  warehouse: OpnameWarehouse;
  scope: OpnameScope;
  counterName: string | null;
  counterId: string | null;
  createdByName: string;
  createdAt: string;
  startedAt: string | null;
  notes: string;
  /** False for a person who counts blind. */
  canSeeValues: boolean;
  lines: OpnameLine[];
  history: OpnameHistoryEntry[];
  summary: OpnameSummary;
}

export interface OpnameListItem {
  id: string;
  number: string;
  status: OpnameStatus;
  date: string;
  warehouse: OpnameWarehouse;
  counted: number;
  total: number;
  diffProducts: number;
  diffValue: number | null;
  createdByName: string;
}

export const OPNAME_STEPS: OpnameStatus[] = ['draft', 'counting', 'pending_approval', 'posted'];

/** Where a status sits on the stepper; a cancelled count is off it. */
export const stepIndex = (status: OpnameStatus): number => OPNAME_STEPS.indexOf(status);

const LOSS_REASONS: OpnameReason[] = ['rusak', 'kedaluwarsa', 'hilang', 'salah_catat', 'lainnya'];
const GAIN_REASONS: OpnameReason[] = ['ditemukan', 'salah_catat', 'lainnya'];

/** The reasons that fit the direction of a difference: a shortage can be lost, a surplus found. */
export const reasonsForDiff = (diff: number | null): OpnameReason[] => {
  if (diff === null || diff === 0) return [];
  return diff < 0 ? LOSS_REASONS : GAIN_REASONS;
};

export type LineIssue = 'reasonRequired' | 'noteRequired' | 'costRequired';

/** What a counted line still needs before the count can be submitted; null when it is complete. */
export const lineIssue = (line: OpnameLine): LineIssue | null => {
  if (line.countedQty === null || line.diffQty === null || line.diffQty === 0) return null;
  if (!line.reason) return 'reasonRequired';
  if (line.reason === 'lainnya' && !line.note.trim()) return 'noteRequired';
  if (line.diffQty > 0 && line.costEditable && !((line.unitCost ?? 0) > 0)) return 'costRequired';
  return null;
};

export type LineState = 'uncounted' | 'counted' | 'match' | 'complete' | LineIssue;

/** One word for where a line stands; a blind counter only learns whether it is counted. */
export const lineState = (line: OpnameLine, canSeeValues: boolean): LineState => {
  if (line.countedQty === null) return 'uncounted';
  if (!canSeeValues) return 'counted';
  if (line.diffQty === null || line.diffQty === 0) return 'match';
  return lineIssue(line) ?? 'complete';
};

export interface SubmitReadiness {
  ready: boolean;
  /** Lines with no count yet; a product that is not there is counted as 0, not left empty. */
  uncounted: number;
  /** Counted lines that still miss a reason, a note or a price. */
  incomplete: number;
}

export const submitReadiness = (lines: OpnameLine[]): SubmitReadiness => {
  const uncounted = lines.filter((line) => line.countedQty === null).length;
  const incomplete = lines.filter((line) => lineIssue(line) !== null).length;
  return { ready: lines.length > 0 && uncounted === 0 && incomplete === 0, uncounted, incomplete };
};

export interface OpnameRights {
  count: boolean;
  review: boolean;
  cancel: boolean;
  approve: boolean;
  /** May delete a draft (the delete right on the stock count menu). */
  remove: boolean;
}

export interface OpnameActions {
  start: boolean;
  editHeader: boolean;
  fillCounts: boolean;
  fillReasons: boolean;
  submit: boolean;
  approve: boolean;
  reject: boolean;
  cancel: boolean;
  /** Only a draft can be deleted; a started count is cancelled instead. */
  remove: boolean;
}

const NO_ACTIONS: OpnameActions = {
  start: false,
  editHeader: false,
  fillCounts: false,
  fillReasons: false,
  submit: false,
  approve: false,
  reject: false,
  cancel: false,
  remove: false,
};

/** What the signed-in person may do with a count in its current status. */
export const opnameActions = (status: OpnameStatus, rights: OpnameRights): OpnameActions => {
  const canWork = rights.count || rights.review;
  switch (status) {
    case 'draft':
      return {
        ...NO_ACTIONS,
        start: canWork,
        editHeader: canWork,
        cancel: rights.cancel,
        remove: rights.remove,
      };
    case 'counting':
      return {
        ...NO_ACTIONS,
        fillCounts: canWork,
        fillReasons: rights.review,
        submit: rights.review,
        cancel: rights.cancel,
      };
    case 'pending_approval':
      return { ...NO_ACTIONS, approve: rights.approve, reject: rights.approve };
    case 'posted':
      return { ...NO_ACTIONS, cancel: rights.cancel };
    default:
      return NO_ACTIONS;
  }
};

export interface JournalPreviewEntry {
  accountId: string;
  accountNumber: string;
  accountName: string;
  reasons: OpnameReason[];
  count: number;
  debit: number;
  credit: number;
}

export interface JournalPreview {
  entries: JournalPreviewEntry[];
  /** Reasons that have no adjustment account yet; the count cannot be posted until they do. */
  missing: OpnameReason[];
}

export interface OpnameInput {
  warehouse: string;
  date: string;
  scope: OpnameScope;
  counterUser: string;
  notes: string;
}

/** One line of a count as it is saved; only what changed is sent. */
export interface OpnameLineChange {
  product: string;
  countedQty?: number;
  reason?: OpnameReason | null;
  note?: string;
  unitCost?: number;
  needsRecount?: boolean;
}

export interface OpnameAccountOption {
  id: string;
  accountNumber: string;
  name: string;
}

/** The adjustment account booked for one reason; unset until Accounting chooses it. */
export interface OpnameAccountRule {
  reason: OpnameReason;
  label: string;
  directions: ('loss' | 'gain')[];
  accountId: string | null;
  options: OpnameAccountOption[];
}

export interface OpnameInputIssues {
  warehouse?: 'warehouse' | 'warehouseBusy';
  date?: 'date';
  products?: 'products';
  categories?: 'categories';
}

/** What is wrong with a new count before it is sent; empty when it can be created. */
export const validateOpnameInput = (
  input: OpnameInput,
  today: string,
  warehouseBusy: boolean
): OpnameInputIssues => {
  const issues: OpnameInputIssues = {};
  if (!input.warehouse) issues.warehouse = 'warehouse';
  else if (warehouseBusy) issues.warehouse = 'warehouseBusy';
  if (!input.date || input.date > today) issues.date = 'date';
  if (input.scope.type === 'manual' && input.scope.productIds.length === 0) {
    issues.products = 'products';
  }
  if (input.scope.type === 'category' && input.scope.categoryIds.length === 0) {
    issues.categories = 'categories';
  }
  return issues;
};
