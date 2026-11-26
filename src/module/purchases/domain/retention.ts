/** What the supplier invoices of a service order hold back until the final handover (BAST). */
export interface RetentionRow {
  purchaseOrderId: string;
  number: string;
  vendorName: string;
  isService: boolean;
  /** The order's own status; `MAINTENANCE` while retention is still held. */
  status: string;
  percent: number;
  maintenanceMonths: number;
  total: number;
  held: number;
  released: number;
  balance: number;
  state: string;
  /** The service's Indonesian wording of `state`. */
  stateLabel: string;
  maintenanceFrom: string | null;
  releasableFrom: string | null;
  reminderDate: string | null;
  daysLeft: number | null;
  releaseBillId: string | null;
}

export interface RetentionReport {
  total: number;
  count: number;
  maintenanceCount: number;
  releasableCount: number;
  rows: RetentionRow[];
}

/** The overview card: the total held and the orders behind it. */
export interface RetentionSummary {
  total: number;
  count: number;
  releasableCount: number;
  orders: {
    purchaseOrderId: string;
    number: string;
    vendorName: string;
    balance: number;
    state: string;
    stateLabel: string;
    releasableFrom: string | null;
    daysLeft: number | null;
  }[];
}

export interface RetentionTask {
  purchaseOrderId: string;
  number: string;
  vendorName: string;
  balance: number;
  type: string;
  /** The service's Indonesian title; English readers get a line of ours from `taskKind`. */
  title: string;
  dueDate: string | null;
  daysLeft: number | null;
}

export type RetentionTiming = { kind: 'waiting'; days: number } | { kind: 'ready' } | null;

/** How far the held money is from being payable: days to wait, ready, or nothing to say. */
export const retentionTiming = (row: Pick<RetentionRow, 'state' | 'daysLeft'>): RetentionTiming => {
  if (row.state === 'RELEASABLE') return { kind: 'ready' };
  if (row.state === 'HELD' && row.daysLeft !== null) return { kind: 'waiting', days: row.daysLeft };
  return null;
};

/** Release is offered only when the maintenance period is over and nothing is released or billed yet. */
export const canReleaseRetention = (
  row: Pick<RetentionRow, 'state' | 'balance' | 'releaseBillId'>
): boolean => row.state === 'RELEASABLE' && row.balance > 0 && row.releaseBillId === null;

export type RetentionTaskKind = 'requestHandover' | 'release' | 'other';

export const taskKind = (type: string): RetentionTaskKind => {
  if (type === 'REQUEST_FINAL_HANDOVER') return 'requestHandover';
  if (type === 'RELEASE_RETENTION') return 'release';
  return 'other';
};

/** What the release would book, as the service works it out (the PPh rate follows the term bills). */
export interface RetentionPreview {
  amount: number;
  withholdingPercent: number;
  withholdingAmount: number;
  finalAmount: number;
  releasableFrom: string | null;
}

export interface RetentionReleaseInput {
  purchaseOrderId: string;
  bastNumber: string;
  /** `YYYY-MM-DD`. */
  releaseDate: string;
  memo: string;
  /** The signed final handover; it goes to the new bill after it is made. */
  file: File | null;
}

export type RetentionReleaseIssue =
  | 'nothingHeld'
  | 'bastNumber'
  | 'date'
  | 'early'
  | 'future'
  | 'file';

/** What stops a release from being sent; empty when it can go. */
export const validateRetentionRelease = (
  values: Pick<RetentionReleaseInput, 'bastNumber' | 'releaseDate' | 'file'>,
  context: { balance: number; releasableFrom: string | null; today: string }
): Partial<Record<RetentionReleaseIssue, true>> => {
  const issues: Partial<Record<RetentionReleaseIssue, true>> = {};
  if (!(context.balance > 0)) issues.nothingHeld = true;
  if (!values.bastNumber.trim()) issues.bastNumber = true;
  if (!values.releaseDate) issues.date = true;
  else if (values.releaseDate > context.today) issues.future = true;
  else if (context.releasableFrom && values.releaseDate < context.releasableFrom) { issues.early = true; }
  if (!values.file) issues.file = true;
  return issues;
};
