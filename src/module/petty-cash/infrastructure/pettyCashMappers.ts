import type {
  AdvanceRecord,
  AdvanceStatusInfo,
  CashBook,
  CountRecord,
  Page,
  PettyCashFund,
  PettyCashLookups,
  PettyCashVoucherRecord,
  ReimbursementRecord,
  ReplenishmentPreview,
} from '@/module/petty-cash/domain/pettyCashEntities';
import type { PettyCashAccessProfile } from '@/module/petty-cash/domain/pettyCashAccess';
import type {
  AdvanceDto,
  AdvanceStatusDto,
  CashBookDto,
  CountDto,
  FundDto,
  LookupsDto,
  MyPermissionsDto,
  PageDto,
  ReimbursementDto,
  ReplenishmentPreviewDto,
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
  pockets: (dto.pockets ?? []).map((pocket) => ({
    code: pocket.code,
    name: pocket.name,
    type: pocket.type,
    provider: pocket.provider ?? null,
    accountNumber: pocket.accountNumber ?? null,
    accountHolder: pocket.accountHolder ?? null,
    isActive: pocket.isActive,
    balance: pocket.balance,
  })),
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
  pocket: dto.pocket ?? 'TUNAI',
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
    tagIds: line.tags ?? [],
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
    pocket: entry.pocket ?? null,
    pocketBalance: entry.pocketBalance ?? null,
    refType: entry.refType,
    refId: entry.refId,
    journalId: entry.journal,
    memo: entry.memo,
    createdAt: entry.createdAt,
  })),
});

export const toLookups = (dto: LookupsDto): PettyCashLookups => ({
  ...dto,
  pocketTypes: dto.pocketTypes ?? [],
});

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

const dateOrNull = (value: string | null) => (value ? toDateOnly(value) : null);

const splitDenominations = (raw: CountDto['denominations']) => {
  const notes: Record<string, number> = {};
  let coins: Record<string, number> = {};
  Object.entries(raw).forEach(([key, value]) => {
    if (key === 'coins' && typeof value === 'object') coins = { ...value };
    else if (typeof value === 'number') notes[key] = value;
  });
  return { notes, coins };
};

export const toCount = (dto: CountDto): CountRecord => ({
  id: dto.id,
  countNumber: dto.countNumber,
  fund: {
    id: dto.fund.id,
    code: dto.fund.code,
    name: dto.fund.name,
    custodianId: dto.fund.custodian,
  },
  countedAt: dto.countedAt,
  countedBy: dto.countedBy,
  witnessedBy: dto.witnessedBy,
  denominations: splitDenominations(dto.denominations),
  totalPhysicalCash: dto.totalPhysicalCash,
  totalCounted: dto.totalCounted ?? dto.totalPhysicalCash,
  pocketResults: dto.pocketResults ?? [],
  pendingVoucherTotal: dto.pendingVoucherTotal,
  outstandingAdvanceTotal: dto.outstandingAdvanceTotal,
  expectedCash: dto.expectedCash,
  varianceAmount: dto.varianceAmount,
  varianceType: dto.varianceType,
  reason: dto.reason,
  status: dto.status,
  submittedAt: dto.submittedAt,
  approvedBy: dto.approvedBy,
  approvedAt: dto.approvedAt,
  rejectedBy: dto.rejectedBy,
  rejectedAt: dto.rejectedAt,
  rejectedReason: dto.rejectedReason,
  settledByReimbursementId: dto.settledByReimbursement,
  pendingApprovers: dto.pendingApprovers ?? [],
  isStale: dto.isStale ?? false,
  createdAt: dto.createdAt,
});

export const toReimbursement = (dto: ReimbursementDto): ReimbursementRecord => ({
  id: dto.id,
  reimbursementNumber: dto.reimbursementNumber,
  fund: {
    id: dto.fund.id,
    code: dto.fund.code,
    name: dto.fund.name,
    custodianId: dto.fund.custodian,
  },
  requestDate: toDateOnly(dto.requestDate),
  bankAccount: dto.bankAccount,
  count: dto.count && { ...dto.count, countedAt: dto.count.countedAt },
  items: dto.items.map((item) =>
    typeof item.voucher === 'string'
      ? { voucherId: item.voucher, voucher: null, amount: item.amount }
      : {
          voucherId: item.voucher.id,
          voucher: {
            voucherNumber: item.voucher.voucherNumber,
            transactionDate: toDateOnly(item.voucher.transactionDate),
            beneficiary: item.voucher.beneficiary,
            totalAmount: item.voucher.totalAmount,
            status: item.voucher.status,
          },
          amount: item.amount,
        }
  ),
  voucherTotal: dto.voucherTotal,
  varianceAmount: dto.varianceAmount,
  totalAmount: dto.totalAmount,
  status: dto.status,
  notes: dto.notes,
  submittedBy: dto.submittedBy,
  submittedAt: dto.submittedAt,
  approvedBy: dto.approvedBy,
  approvedAt: dto.approvedAt,
  rejectedBy: dto.rejectedBy,
  rejectedAt: dto.rejectedAt,
  rejectedReason: dto.rejectedReason,
  cancelledBy: dto.cancelledBy,
  cancelledAt: dto.cancelledAt,
  disbursedBy: dto.disbursedBy,
  disbursedAt: dto.disbursedAt,
  disbursementDate: dateOrNull(dto.disbursementDate),
  journalId: dto.journal,
  cashBalanceAfter: dto.cashBalanceAfter ?? null,
  pendingApprovers: dto.pendingApprovers ?? [],
  pocket: dto.pocket ?? null,
});

export const toPreview = (dto: ReplenishmentPreviewDto): ReplenishmentPreview => ({ ...dto });

export const toAdvance = (dto: AdvanceDto): AdvanceRecord => ({
  id: dto.id,
  advanceNumber: dto.advanceNumber,
  fund: {
    id: dto.fund.id,
    code: dto.fund.code,
    name: dto.fund.name,
    custodianId: dto.fund.custodian,
  },
  disbursePocket: dto.disbursePocket ?? null,
  requester: dto.requester,
  purpose: dto.purpose,
  requestedAmount: dto.requestedAmount,
  amount: dto.amount,
  status: dto.status,
  approvedBy: dto.approvedBy,
  approvedAt: dto.approvedAt,
  rejectedReason: dto.rejectedReason,
  disbursedBy: dto.disbursedBy,
  disbursedAt: dto.disbursedAt,
  dueAt: dto.dueAt,
  cashSettledNet: dto.cashSettledNet,
  custodianVerifiedBy: dto.custodianVerifiedBy,
  custodianVerifiedAt: dto.custodianVerifiedAt,
  financeVerifiedBy: dto.financeVerifiedBy,
  financeVerifiedAt: dto.financeVerifiedAt,
  settlementRejectedReason: dto.settlementRejectedReason,
  voucher: typeof dto.voucher === 'object' ? dto.voucher : null,
  receivableJournalId: dto.receivableJournal,
  receivableAmount: dto.receivableAmount,
  convertedAt: dto.convertedAt,
  statusHistory: dto.statusHistory.map((entry) => ({
    status: entry.status,
    at: entry.at,
    byId: entry.by,
    note: entry.note,
  })),
  settlement: {
    beneficiary: dto.settlement.beneficiary ?? '',
    description: dto.settlement.description ?? '',
    receiptNumber: dto.settlement.receiptNumber ?? '',
    transactionDate: dateOrNull(dto.settlement.transactionDate ?? null),
    actualTotal: dto.settlement.actualTotal ?? 0,
    submittedAt: dto.settlement.submittedAt ?? null,
    lines: (dto.settlement.lines ?? []).map((line) => ({
      lineNo: line.lineNo,
      expenseAccount: typeof line.expenseAccount === 'object' ? line.expenseAccount : null,
      description: line.description,
      amount: line.amount,
    })),
  },
  attachments: (dto.attachments ?? []).map(({ id, fileName, mimeType, sizeBytes, createdAt }) => ({
    id,
    fileName,
    mimeType,
    sizeBytes,
    createdAt,
  })),
  outstandingAmount: dto.outstandingAmount,
  isOverdue: dto.isOverdue,
  createdAt: dto.createdAt,
});

export const toAdvanceStatus = (dto: AdvanceStatusDto): AdvanceStatusInfo => ({
  user: dto.user,
  isBlocked: dto.isBlocked,
  reasons: dto.reasons.map((reason) => ({
    type: reason.type,
    reason: reason.reason,
    since: reason.since ?? null,
  })),
  overrideUntil: dto.restriction?.overdueOverrideUntil ?? null,
  outstandingAmount: dto.outstandingAmount,
});
