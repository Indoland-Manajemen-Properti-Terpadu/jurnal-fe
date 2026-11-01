/** Status vocabulary of `/v1/petty-cash`, as observed on the backend (docs/petty-cash/API-REAL-SHAPES.md). */
export const FUND_STATUSES = ['ACTIVE', 'INACTIVE', 'CLOSED'] as const;
export const VOUCHER_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'PENDING_REIMBURSE',
  'IN_REIMBURSEMENT',
  'REIMBURSED',
  'REJECTED',
  'VOID',
] as const;
export const COUNT_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'SUPERSEDED',
  'SETTLED',
] as const;
export const REIMBURSEMENT_STATUSES = [
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'DISBURSED',
] as const;
export const ADVANCE_STATUSES = [
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'DISBURSED',
  'SETTLEMENT_SUBMITTED',
  'CUSTODIAN_VERIFIED',
  'SETTLED',
  'CONVERTED_TO_RECEIVABLE',
] as const;

export type FundStatus = (typeof FUND_STATUSES)[number];
export type VoucherStatus = (typeof VOUCHER_STATUSES)[number];
export type CountStatus = (typeof COUNT_STATUSES)[number];
export type ReimbursementStatus = (typeof REIMBURSEMENT_STATUSES)[number];
export type AdvanceStatus = (typeof ADVANCE_STATUSES)[number];
export type VoucherSource = 'DIRECT' | 'ADVANCE';

/** Semantic tone only: red is for a refusal, never for a normal expense (ui-guidelines color budget). */
export type StatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'muted';

export const fundStatusTone: Record<FundStatus, StatusTone> = {
  ACTIVE: 'success',
  INACTIVE: 'muted',
  CLOSED: 'muted',
};

export const voucherStatusTone: Record<VoucherStatus, StatusTone> = {
  DRAFT: 'neutral',
  PENDING_APPROVAL: 'warning',
  PENDING_REIMBURSE: 'info',
  IN_REIMBURSEMENT: 'info',
  REIMBURSED: 'success',
  REJECTED: 'danger',
  VOID: 'muted',
};

export const countStatusTone: Record<CountStatus, StatusTone> = {
  DRAFT: 'neutral',
  SUBMITTED: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  SUPERSEDED: 'muted',
  SETTLED: 'success',
};

export const reimbursementStatusTone: Record<ReimbursementStatus, StatusTone> = {
  SUBMITTED: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  CANCELLED: 'muted',
  DISBURSED: 'success',
};

export const advanceStatusTone: Record<AdvanceStatus, StatusTone> = {
  PENDING_APPROVAL: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  CANCELLED: 'muted',
  DISBURSED: 'info',
  SETTLEMENT_SUBMITTED: 'warning',
  CUSTODIAN_VERIFIED: 'warning',
  SETTLED: 'success',
  CONVERTED_TO_RECEIVABLE: 'muted',
};

export type VoucherAction =
  | 'edit'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'void'
  | 'uploadAttachment'
  | 'deleteAttachment';

const VOUCHER_ACTIONS: Record<VoucherStatus, VoucherAction[]> = {
  DRAFT: ['edit', 'submit', 'uploadAttachment', 'deleteAttachment'],
  // A rejected voucher returns to DRAFT through edit, then it is submitted again.
  REJECTED: ['edit', 'uploadAttachment', 'deleteAttachment'],
  PENDING_APPROVAL: ['approve', 'reject', 'void', 'uploadAttachment'],
  PENDING_REIMBURSE: ['void', 'uploadAttachment'],
  IN_REIMBURSEMENT: [],
  REIMBURSED: [],
  VOID: [],
};

/** Actions the backend accepts for a voucher in this status; kasbon vouchers cannot be voided or changed. */
export const voucherActionsFor = (status: VoucherStatus, source: VoucherSource): VoucherAction[] =>
  source === 'ADVANCE'
    ? VOUCHER_ACTIONS[status].filter((action) => action === 'approve' || action === 'reject')
    : VOUCHER_ACTIONS[status];
