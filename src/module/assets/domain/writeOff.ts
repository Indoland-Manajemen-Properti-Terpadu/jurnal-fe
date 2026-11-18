import type { AccountRef, AssetPagination } from '@/module/assets/domain/asset';

/** Why an asset leaves the books; every disposal goes through a signed write-off report. */
export const WRITE_OFF_TYPES = [
  'sold',
  'scrapped',
  'fully_depreciated',
  'damaged',
  'lost',
] as const;
export type WriteOffType = (typeof WRITE_OFF_TYPES)[number];

export const isWriteOffType = (value: unknown): value is WriteOffType =>
  typeof value === 'string' && (WRITE_OFF_TYPES as readonly string[]).includes(value);

export type WriteOffStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

/** The asset as it was when the report was filed. */
export interface WriteOffSnapshot {
  code: string;
  name: string;
  categoryName: string | null;
  location?: string;
  brand?: string;
  modelType?: string;
  serialNumber?: string;
  acquisitionDate: string;
  acquisitionCost: number;
  accumulatedDepreciation: number;
  bookValue: number;
  /** Positive is a gain, negative a loss. */
  estimatedGainLoss: number;
}

/** What the approval booked. */
export interface WriteOffResult {
  accumulatedDepreciation: number;
  bookValue: number;
  gainLoss: number;
}

export interface WriteOffFile {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
}

export interface WriteOffSignature {
  title: string;
  name: string | null;
  role: string;
  signedAt: string | null;
  state: 'signed' | 'waiting' | 'rejected';
  imageUrl: string | null;
  /** Reason of a rejection, or the approver's note. */
  note: string | null;
}

export interface WriteOffReport {
  id: string;
  number: string;
  assetId: string;
  type: WriteOffType;
  status: WriteOffStatus;
  /** `YYYY-MM-DD` */
  incidentDate: string;
  description: string;
  proceedsAmount: number;
  proceedsAccount: AccountRef | null;
  gainLossAccount: AccountRef | null;
  attachments: WriteOffFile[];
  snapshot: WriteOffSnapshot;
  result: WriteOffResult | null;
  signatures: WriteOffSignature[];
  createdBy: { id: string; name: string };
  submittedAt: string;
  decidedAt: string | null;
  /** Roles whose signature is still missing. */
  waitingOnRoles: string[];
  canDecide: boolean;
}

/** Input of the report form. */
export interface WriteOffDraft {
  type: WriteOffType | null;
  incidentDate: string;
  description: string;
  /** For types other than a sale: the user says money came in (an insurance claim, scrap sale). */
  hasProceeds: boolean;
  proceedsAmount: number;
  proceedsAccount: string;
  /** Optional: empty lets the API use its mapped gain or loss account. */
  gainLossAccount: string;
  evidence: File[];
  signature: Blob | null;
}

export interface WriteOffListParams {
  page: number;
  limit: number;
  status?: WriteOffStatus;
  type?: WriteOffType;
  search?: string;
  assetId?: string;
}

export interface WriteOffPage {
  items: WriteOffReport[];
  pagination: AssetPagination;
}

/** Depreciation the books are still missing for an asset. */
export interface DepreciationDue {
  months: number;
  amount: number;
  /** `YYYY-MM`, empty when the API did not say. */
  upTo: string;
}

export interface DepreciationRunLine {
  code: string;
  reason: string;
}

export interface DepreciationRunResult {
  upTo: string;
  months: number;
  amount: number;
  plan: { code: string; months: number; from: string; to: string; amount: number }[];
  skipped: DepreciationRunLine[];
  failed: DepreciationRunLine[];
}
