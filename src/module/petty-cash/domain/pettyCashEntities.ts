import type {
  FundStatus,
  VoucherSource,
  VoucherStatus,
} from '@/module/petty-cash/domain/pettyCashStatus';

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
  bankAccounts: AccountRef[];
  taxes: TaxRef[];
  tags: Array<{ id: string; name: string; color: string }>;
  users: UserRef[];
}
