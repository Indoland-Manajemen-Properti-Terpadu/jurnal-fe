import type {
  CashBook,
  Page,
  PettyCashFund,
  PettyCashLookups,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type { PettyCashAccessProfile } from '@/module/petty-cash/domain/pettyCashAccess';
import type {
  CashBookDto,
  FundDto,
  LookupsDto,
  MyPermissionsDto,
  PageDto,
  VoucherDto,
} from '@/module/petty-cash/infrastructure/pettyCashDto';

/**
 * Accounting dates come back as ISO at UTC midnight (`2026-10-31T00:00:00.000Z`) for a `YYYY-MM-DD`
 * request. Take the calendar part; converting through the local time zone could shift the day.
 */
export const toDateOnly = (value: string) => value.slice(0, 10);

export const toPage = <Dto, T>(dto: PageDto<Dto>, map: (item: Dto) => T): Page<T> => ({
  items: dto.results.map(map),
  page: dto.page,
  limit: dto.limit,
  totalPages: dto.totalPages,
  totalResults: dto.totalResults,
});

export const toFund = (dto: FundDto): PettyCashFund => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  account: dto.account,
  pagu: dto.pagu,
  custodian: dto.custodian,
  status: dto.status,
  settings: {
    warningThresholdPct: dto.warningThresholdPct,
    voucherApprovalThreshold: dto.voucherApprovalThreshold,
    attachmentRequiredThreshold: dto.attachmentRequiredThreshold,
    requireCountBeforeReimbursement: dto.requireCountBeforeReimbursement,
    requireWitness: dto.requireWitness,
    singleUserOverride: dto.singleUserOverride,
    advanceMaxAmount: dto.advanceMaxAmount,
    advanceApprovalThreshold: dto.advanceApprovalThreshold,
    advanceSettlementDays: dto.advanceSettlementDays,
    advanceExcludeSaturday: dto.advanceExcludeSaturday,
    advanceExcludeSunday: dto.advanceExcludeSunday,
  },
  balance: {
    cashBalance: dto.cashBalance,
    availableCash: dto.availableCash,
    reservedAmount: dto.reservedAmount,
    pendingVoucherAmount: dto.pendingVoucherAmount,
    outstandingAdvanceAmount: dto.outstandingAdvanceAmount,
    unsettledVariance: dto.unsettledVariance,
    replenishmentAmount: dto.replenishmentAmount,
    availableCashRatio: dto.availableCashRatio,
    needsReplenishment: dto.needsReplenishment,
    isBalanced: dto.isBalanced,
  },
  lastCountAt: dto.lastCountAt,
  closedAt: dto.closedAt,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toVoucher = (dto: VoucherDto): PettyCashVoucherRecord => ({
  id: dto.id,
  fund: {
    id: dto.fund.id,
    code: dto.fund.code,
    name: dto.fund.name,
    custodianId: dto.fund.custodian,
  },
  voucherNumber: dto.voucherNumber,
  source: dto.source,
  advanceId: dto.advance,
  transactionDate: toDateOnly(dto.transactionDate),
  beneficiary: dto.beneficiary,
  description: dto.description,
  receiptNumber: dto.receiptNumber,
  taxInvoiceNumber: dto.taxInvoiceNumber,
  vendorTaxId: dto.vendorTaxId,
  lines: dto.lines.map((line) => ({
    lineNo: line.lineNo,
    expenseAccountId:
      typeof line.expenseAccount === 'string' ? line.expenseAccount : line.expenseAccount.id,
    expenseAccount: typeof line.expenseAccount === 'string' ? null : line.expenseAccount,
    description: line.description,
    amount: line.amount,
    tax: typeof line.tax === 'object' ? line.tax : null,
    taxAmount: line.taxAmount,
  })),
  totalAmount: dto.totalAmount,
  status: dto.status,
  requestedBy: dto.requestedBy,
  submittedAt: dto.submittedAt,
  approvedBy: dto.approvedBy,
  approvedAt: dto.approvedAt,
  rejectedReason: dto.rejectedReason,
  rejectedAt: dto.rejectedAt,
  voidReason: dto.voidReason,
  voidedAt: dto.voidedAt,
  reimbursementId: dto.reimbursement,
  attachments: (dto.attachments ?? []).map(({ id, fileName, mimeType, sizeBytes, createdAt }) => ({
    id,
    fileName,
    mimeType,
    sizeBytes,
    createdAt,
  })),
  warnings: dto.warnings ?? [],
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toCashBook = (dto: CashBookDto): CashBook => ({
  fund: dto.fund,
  openingBalance: dto.openingBalance,
  closingBalance: dto.closingBalance,
  entries: toPage(dto, (entry) => ({
    id: entry.id,
    seq: entry.seq,
    txnDate: toDateOnly(entry.txnDate),
    type: entry.type,
    direction: entry.direction,
    amount: entry.amount,
    runningBalance: entry.runningBalance,
    refType: entry.refType,
    refId: entry.refId,
    journalId: entry.journal,
    memo: entry.memo,
    createdAt: entry.createdAt,
  })),
});

export const toLookups = (dto: LookupsDto): PettyCashLookups => dto;

export const toAccessProfile = (userId: string, dto: MyPermissionsDto): PettyCashAccessProfile => ({
  userId,
  isSuperAdmin: dto.role === 'superadmin',
  rights: Object.fromEntries(
    dto.permissions.map(({ menuId, create, read, update, delete: remove }) => [
      menuId,
      { create, read, update, delete: remove },
    ])
  ),
});
