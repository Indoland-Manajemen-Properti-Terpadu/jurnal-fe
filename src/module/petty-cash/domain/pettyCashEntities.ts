import type {
  AdvanceStatus,
  CountStatus,
  FundStatus,
  ReimbursementStatus,
  VoucherSource,
  VoucherStatus,
} from '@/module/petty-cash/domain/pettyCashStatus';
import type { PendingApprover } from '@/module/petty-cash/domain/approval';

/**
 * Entities of the integrated module. Money is whole rupiah as the backend sends it (integers);
 * balances, variance and journals are server figures and are never recomputed here.
 * Accounting dates are `YYYY-MM-DD`, timestamps ISO UTC.
 */
export interface UserRef {
  id: string;
  name: string;
  email: string;
}

export interface AccountRef {
  id: string;
  name: string;
  accountNumber: string;
}

export interface TaxRef {
  id: string;
  name: string;
  rate: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface FundSettings {
  warningThresholdPct: number;
  voucherApprovalThreshold: number;
  attachmentRequiredThreshold: number;
  requireCountBeforeReimbursement: boolean;
  requireWitness: boolean;
  singleUserOverride: boolean;
  advanceMaxAmount: number;
  advanceApprovalThreshold: number;
  advanceSettlementDays: number;
  advanceExcludeSaturday: boolean;
  advanceExcludeSunday: boolean;
}

/** Imprest identity: pagu = cashBalance + pendingVoucherAmount + outstandingAdvanceAmount - unsettledVariance. */
export interface FundBalance {
  cashBalance: number;
  availableCash: number;
  reservedAmount: number;
  pendingVoucherAmount: number;
  outstandingAdvanceAmount: number;
  unsettledVariance: number;
  replenishmentAmount: number;
  availableCashRatio: number;
  needsReplenishment: boolean;
  isBalanced: boolean;
}

/**
 * A balance pocket splits the fund's cash book (cash box, a petty cash bank account, an e-wallet).
 * All pockets share one ledger account, so the pocket balances add up to the fund's cash balance.
 * `code` identifies the pocket (`TUNAI` is the built-in cash box); `type` drives the icon and rules.
 */
export type PocketType = 'CASH' | 'BANK' | 'EWALLET';

export interface FundPocket {
  code: string;
  name: string;
  type: PocketType;
  provider: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  isActive: boolean;
  balance: number;
}

export interface PettyCashFund {
  id: string;
  code: string;
  name: string;
  account: AccountRef;
  pagu: number;
  custodian: UserRef;
  status: FundStatus;
  settings: FundSettings;
  balance: FundBalance;
  pockets: FundPocket[];
  lastCountAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherLine {
  lineNo: number;
  expenseAccountId: string;
  /** Only the voucher detail carries the account; list items carry just the id. */
  expenseAccount: AccountRef | null;
  description: string;
  /** Net amount before tax; tax is added on top. */
  amount: number;
  tax: TaxRef | null;
  taxAmount: number;
  /** Tag ids; resolve names through `lookups.tags`. */
  tagIds: string[];
}

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface VoucherWarning {
  code: string;
  message: string;
}

export interface PettyCashVoucherRecord {
  id: string;
  fund: { id: string; code: string; name: string; custodianId: string };
  voucherNumber: string;
  /** Pocket the voucher is paid from (`TUNAI` unless another was chosen). */
  pocket: string;
  source: VoucherSource;
  advanceId: string | null;
  transactionDate: string;
  beneficiary: string;
  description: string;
  receiptNumber: string;
  taxInvoiceNumber: string | null;
  vendorTaxId: string | null;
  lines: VoucherLine[];
  /** Sum of net amounts plus tax. */
  totalAmount: number;
  status: VoucherStatus;
  requestedBy: UserRef | null;
  submittedAt: string | null;
  approvedBy: UserRef | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  rejectedAt: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  reimbursementId: string | null;
  /** Empty in list responses; only the detail carries them. */
  attachments: Attachment[];
  warnings: VoucherWarning[];
  createdAt: string;
  updatedAt: string;
}

export type CashBookDirection = 'IN' | 'OUT';

export interface CashBookEntry {
  id: string;
  seq: number;
  txnDate: string;
  type: string;
  direction: CashBookDirection;
  amount: number;
  runningBalance: number;
  /** Pocket code the movement belongs to; null on entries recorded before pockets existed. */
  pocket: string | null;
  pocketBalance: number | null;
  refType: string;
  refId: string;
  journalId: string | null;
  memo: string;
  createdAt: string;
}

export interface CashBook {
  fund: { id: string; code: string; name: string };
  openingBalance: number;
  closingBalance: number;
  entries: Page<CashBookEntry>;
}

export interface PettyCashLookups {
  expenseAccounts: AccountRef[];
  /** Types a user may add as a pocket (the cash box is built in). */
  pocketTypes: Array<{ value: string; label: string }>;
  bankAccounts: AccountRef[];
  taxes: TaxRef[];
  tags: Array<{ id: string; name: string; color: string }>;
  users: UserRef[];
}

export type VarianceType = 'SHORT' | 'OVER' | 'BALANCED';

/** Pieces counted per denomination, as the backend stores them. */
export interface CountDenominations {
  notes: Record<string, number>;
  coins: Record<string, number>;
}

export interface CountRecord {
  id: string;
  countNumber: string;
  fund: { id: string; code: string; name: string; custodianId: string };
  countedAt: string;
  countedBy: UserRef | null;
  witnessedBy: UserRef | null;
  denominations: CountDenominations;
  totalPhysicalCash: number;
  /** Everything counted: the cash box plus the balance of each non-cash pocket. */
  totalCounted: number;
  /** Book, expected, counted and variance per pocket; empty for a fund without pockets. */
  pocketResults: Array<{
    pocket: string;
    name: string;
    type: PocketType;
    bookBalance: number;
    expected: number;
    counted: number;
    variance: number;
  }>;
  pendingVoucherTotal: number;
  outstandingAdvanceTotal: number;
  /** pagu - pending vouchers - outstanding advances, worked out by the backend. */
  expectedCash: number;
  /** Counted minus expected: negative is a shortage. */
  varianceAmount: number;
  varianceType: VarianceType;
  reason: string | null;
  status: CountStatus;
  submittedAt: string | null;
  approvedBy: UserRef | null;
  approvedAt: string | null;
  rejectedBy: UserRef | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  settledByReimbursementId: string | null;
  /** Stages still to approve while submitted; the first one is being waited for. Empty otherwise. */
  pendingApprovers: PendingApprover[];
  /** A cash movement happened after the count, so it no longer reflects the cash in the box. */
  isStale: boolean;
  createdAt: string;
}

export interface ReimbursementItem {
  voucherId: string;
  /** Present in the detail answer only; list items carry just the voucher id. */
  voucher: {
    voucherNumber: string;
    transactionDate: string;
    beneficiary: string;
    totalAmount: number;
    status: VoucherStatus;
  } | null;
  amount: number;
}

export interface ReimbursementRecord {
  id: string;
  reimbursementNumber: string;
  fund: { id: string; code: string; name: string; custodianId: string };
  requestDate: string;
  bankAccount: AccountRef;
  count: {
    id: string;
    countNumber: string;
    countedAt: string;
    varianceAmount: number;
    varianceType: VarianceType;
    status: CountStatus;
  } | null;
  items: ReimbursementItem[];
  voucherTotal: number;
  /** Open variance of the approved count: negative is a shortage the fund gets refilled for. */
  varianceAmount: number;
  /** What the bank pays: vouchers plus the shortage (or minus a surplus). */
  totalAmount: number;
  status: ReimbursementStatus;
  notes: string | null;
  submittedBy: UserRef | null;
  submittedAt: string | null;
  approvedBy: UserRef | null;
  approvedAt: string | null;
  rejectedBy: UserRef | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  cancelledBy: UserRef | null;
  cancelledAt: string | null;
  disbursedBy: UserRef | null;
  disbursedAt: string | null;
  disbursementDate: string | null;
  journalId: string | null;
  /** Only in the answer to a disbursement. */
  cashBalanceAfter: number | null;
  /** Stages still to approve while submitted; the first one is being waited for. Empty otherwise. */
  pendingApprovers: PendingApprover[];
  /** Pocket that receives the refill; null on older documents. */
  pocket: string | null;
}

export interface JournalPreviewLine {
  account: string;
  debit: number;
  credit: number;
}

export interface ReplenishmentPreview {
  voucherTotal: number;
  varianceAmount: number;
  varianceType: VarianceType;
  totalAmount: number;
  voucherCount: number;
  countId: string | null;
  expenseBreakdown: Array<{ accountId: string; account: string; amount: number }>;
  taxBreakdown: Array<{ accountId: string; account: string; amount: number }>;
  journalPreview: JournalPreviewLine[];
  isBalanced: boolean;
  cashAfterDisbursement: number;
  warnings: Array<{ code: string; message: string }>;
}

export interface AdvanceSettlementLine {
  lineNo: number;
  /** Null until a verifier assigns the expense account; finance cannot verify while one is missing. */
  expenseAccount: AccountRef | null;
  description: string;
  amount: number;
}

export interface AdvanceSettlement {
  beneficiary: string;
  description: string;
  receiptNumber: string;
  transactionDate: string | null;
  actualTotal: number;
  lines: AdvanceSettlementLine[];
  submittedAt: string | null;
}

export interface AdvanceHistoryEntry {
  status: AdvanceStatus;
  at: string;
  /** User id; names come from the lookups. */
  byId: string;
  note: string | null;
}

export interface AdvanceRecord {
  id: string;
  advanceNumber: string;
  fund: { id: string; code: string; name: string; custodianId: string };
  /** Pocket the cash was handed out from; the leftover returns there by default. */
  disbursePocket: string | null;
  requester: UserRef;
  purpose: string;
  requestedAmount: number;
  /** The approved amount; the approver may lower it. */
  amount: number;
  status: AdvanceStatus;
  approvedBy: UserRef | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  disbursedBy: UserRef | null;
  disbursedAt: string | null;
  dueAt: string | null;
  /** Positive: the leftover cash that came back to the box. */
  cashSettledNet: number;
  custodianVerifiedBy: UserRef | null;
  custodianVerifiedAt: string | null;
  financeVerifiedBy: UserRef | null;
  financeVerifiedAt: string | null;
  settlementRejectedReason: string | null;
  voucher: { id: string; voucherNumber: string; status: VoucherStatus } | null;
  receivableJournalId: string | null;
  receivableAmount: number;
  convertedAt: string | null;
  statusHistory: AdvanceHistoryEntry[];
  settlement: AdvanceSettlement;
  /** Empty in list items; only the detail carries them. */
  attachments: Attachment[];
  outstandingAmount: number;
  isOverdue: boolean;
  createdAt: string;
}

export type RestrictionReasonType = 'MANUAL' | 'OVERDUE';

/** Whether a user may ask for an advance, and why not. */
export interface AdvanceStatusInfo {
  user: UserRef;
  isBlocked: boolean;
  reasons: Array<{ type: RestrictionReasonType; reason: string; since: string | null }>;
  overrideUntil: string | null;
  outstandingAmount: number;
}
