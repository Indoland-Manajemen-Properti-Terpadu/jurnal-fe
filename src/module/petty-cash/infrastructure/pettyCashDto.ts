import type {
  AdvanceStatus,
  CountStatus,
  FundStatus,
  ReimbursementStatus,
  VoucherSource,
  VoucherStatus,
} from '@/module/petty-cash/domain/pettyCashStatus';

/** Raw `/v1/petty-cash` response shapes (docs/petty-cash/API-REAL-SHAPES.md). Only fields the app reads. */
export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageDto<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface UserRefDto {
  id: string;
  name: string;
  email: string;
}

export interface AccountRefDto {
  id: string;
  name: string;
  accountNumber: string;
}

export interface TaxRefDto {
  id: string;
  name: string;
  rate: number;
}

export interface FundDto {
  id: string;
  code: string;
  name: string;
  account: AccountRefDto;
  pagu: number;
  custodian: UserRefDto;
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
  status: FundStatus;
  closedAt: string | null;
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
  lastCountAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherLineDto {
  lineNo: number;
  /** An object in the voucher detail, a bare id in list items. */
  expenseAccount: AccountRefDto | string;
  description: string;
  amount: number;
  tax: TaxRefDto | string | null;
  taxAmount: number;
}

export interface AttachmentDto {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface VoucherDto {
  id: string;
  fund: { id: string; code: string; name: string; custodian: string };
  voucherNumber: string;
  source: VoucherSource;
  advance: string | null;
  transactionDate: string;
  beneficiary: string;
  description: string;
  receiptNumber: string;
  taxInvoiceNumber: string | null;
  vendorTaxId: string | null;
  lines: VoucherLineDto[];
  totalAmount: number;
  status: VoucherStatus;
  requestedBy: UserRefDto | null;
  submittedAt: string | null;
  approvedBy: UserRefDto | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  rejectedAt: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  reimbursement: string | null;
  attachments?: AttachmentDto[];
  warnings?: Array<{ code: string; message: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CashBookEntryDto {
  id: string;
  seq: number;
  txnDate: string;
  type: string;
  direction: 'IN' | 'OUT';
  amount: number;
  runningBalance: number;
  refType: string;
  refId: string;
  journal: string | null;
  memo: string;
  createdAt: string;
}

export interface CashBookDto extends PageDto<CashBookEntryDto> {
  fund: { id: string; code: string; name: string };
  openingBalance: number;
  closingBalance: number;
}

export interface LookupsDto {
  expenseAccounts: AccountRefDto[];
  bankAccounts: AccountRefDto[];
  taxes: TaxRefDto[];
  tags: Array<{ id: string; name: string; color: string }>;
  users: UserRefDto[];
}

export interface MyPermissionsDto {
  role: string;
  permissions: Array<{
    menuId: string;
    name: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }>;
}

export type VarianceTypeDto = 'SHORT' | 'OVER' | 'BALANCED';

export interface CountDto {
  id: string;
  fund: { id: string; code: string; name: string; custodian: string };
  countNumber: string;
  countedAt: string;
  countedBy: UserRefDto | null;
  witnessedBy: UserRefDto | null;
  /** Banknote pieces by denomination, plus a nested `coins` object. */
  denominations: Record<string, number | Record<string, number>>;
  totalPhysicalCash: number;
  pendingVoucherTotal: number;
  outstandingAdvanceTotal: number;
  expectedCash: number;
  varianceAmount: number;
  varianceType: VarianceTypeDto;
  reason: string | null;
  status: CountStatus;
  submittedAt: string | null;
  approvedBy: UserRefDto | null;
  approvedAt: string | null;
  rejectedBy: UserRefDto | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  settledByReimbursement: string | null;
  isStale?: boolean;
  createdAt: string;
}

export interface ReimbursementItemDto {
  /** An object in the detail answer, a bare id in list items. */
  voucher:
    | string
    | {
        id: string;
        voucherNumber: string;
        transactionDate: string;
        beneficiary: string;
        totalAmount: number;
        status: VoucherStatus;
      };
  amount: number;
}

export interface ReimbursementDto {
  id: string;
  reimbursementNumber: string;
  fund: { id: string; code: string; name: string; custodian: string };
  requestDate: string;
  bankAccount: AccountRefDto;
  count: {
    id: string;
    countNumber: string;
    countedAt: string;
    varianceAmount: number;
    varianceType: VarianceTypeDto;
    status: CountStatus;
  } | null;
  items: ReimbursementItemDto[];
  voucherTotal: number;
  varianceAmount: number;
  totalAmount: number;
  status: ReimbursementStatus;
  notes: string | null;
  submittedBy: UserRefDto | null;
  submittedAt: string | null;
  approvedBy: UserRefDto | null;
  approvedAt: string | null;
  rejectedBy: UserRefDto | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  cancelledBy: UserRefDto | null;
  cancelledAt: string | null;
  disbursedBy: UserRefDto | null;
  disbursedAt: string | null;
  disbursementDate: string | null;
  journal: string | null;
  cashBalanceAfter?: number;
}

export interface ReplenishmentPreviewDto {
  voucherTotal: number;
  varianceAmount: number;
  varianceType: VarianceTypeDto;
  totalAmount: number;
  voucherCount: number;
  countId: string | null;
  expenseBreakdown: Array<{ accountId: string; account: string; amount: number }>;
  taxBreakdown: Array<{ accountId: string; account: string; amount: number }>;
  journalPreview: Array<{ account: string; debit: number; credit: number }>;
  isBalanced: boolean;
  cashAfterDisbursement: number;
  warnings: Array<{ code: string; message: string }>;
}

export interface AdvanceSettlementLineDto {
  lineNo: number;
  /** An object in the detail answer; list items may carry only the id. */
  expenseAccount: AccountRefDto | string | null;
  description: string;
  amount: number;
}

export interface AdvanceDto {
  id: string;
  advanceNumber: string;
  fund: { id: string; code: string; name: string; custodian: string };
  requester: UserRefDto;
  purpose: string;
  requestedAmount: number;
  amount: number;
  status: AdvanceStatus;
  approvedBy: UserRefDto | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  disbursedBy: UserRefDto | null;
  disbursedAt: string | null;
  dueAt: string | null;
  cashSettledNet: number;
  custodianVerifiedBy: UserRefDto | null;
  custodianVerifiedAt: string | null;
  financeVerifiedBy: UserRefDto | null;
  financeVerifiedAt: string | null;
  settlementRejectedReason: string | null;
  voucher: { id: string; voucherNumber: string; status: VoucherStatus } | string | null;
  receivableJournal: string | null;
  receivableAmount: number;
  convertedAt: string | null;
  statusHistory: Array<{ status: AdvanceStatus; at: string; by: string; note: string | null }>;
  settlement: {
    beneficiary?: string;
    description?: string;
    receiptNumber?: string;
    transactionDate?: string | null;
    actualTotal?: number;
    lines?: AdvanceSettlementLineDto[];
    submittedAt?: string | null;
  };
  attachments?: AttachmentDto[];
  outstandingAmount: number;
  isOverdue: boolean;
  createdAt: string;
}

export interface AdvanceStatusDto {
  user: UserRefDto;
  isBlocked: boolean;
  reasons: Array<{ type: 'MANUAL' | 'OVERDUE'; reason: string; since?: string | null }>;
  restriction: { overdueOverrideUntil: string | null } | null;
  outstandingAmount: number;
}
