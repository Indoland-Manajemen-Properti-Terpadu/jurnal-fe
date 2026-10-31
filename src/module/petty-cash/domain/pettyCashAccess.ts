import {
  voucherActionsFor,
  type VoucherAction,
  type CountStatus,
  type ReimbursementStatus,
  type VoucherSource,
  type VoucherStatus,
} from '@/module/petty-cash/domain/pettyCashStatus';

/** Menu codes of the petty cash module (`GET /v1/users/me/permissions`). */
export type PettyCashMenu =
  | 'JP-PC'
  | 'JP-PC-VCH'
  | 'JP-PC-APR'
  | 'JP-PC-CNT'
  | 'JP-PC-RMB'
  | 'JP-PC-DSB'
  | 'JP-PC-ADV'
  | 'JP-PC-CST'
  | 'JP-PC-CTL';

export type MenuAction = 'create' | 'read' | 'update' | 'delete';
export type MenuRight = Record<MenuAction, boolean>;

export interface PettyCashAccessProfile {
  userId: string;
  isSuperAdmin: boolean;
  rights: Partial<Record<string, MenuRight>>;
}

export interface FundAccessContext {
  custodianId: string;
  singleUserOverride: boolean;
}

export interface VoucherAccessContext {
  status: VoucherStatus;
  source: VoucherSource;
  requestedById: string | null;
}

export const canAccess = (
  profile: PettyCashAccessProfile,
  menu: PettyCashMenu,
  action: MenuAction
): boolean => profile.isSuperAdmin || Boolean(profile.rights[menu]?.[action]);

/**
 * The backend lets a superadmin act as custodian of any fund (observed, BACKEND-QUESTIONS item 1).
 * Kept in this one place so the rule can change when the backend answers.
 */
export const isFundCustodian = (profile: PettyCashAccessProfile, fund: FundAccessContext) =>
  profile.isSuperAdmin || profile.userId === fund.custodianId;

const isCreator = (profile: PettyCashAccessProfile, voucher: VoucherAccessContext) =>
  voucher.requestedById !== null && voucher.requestedById === profile.userId;

/** Voucher actions this user may take: status allows it, the menu right exists, and SoD holds. */
export const allowedVoucherActions = (
  profile: PettyCashAccessProfile,
  voucher: VoucherAccessContext,
  fund: FundAccessContext
): VoucherAction[] => {
  const custodian = isFundCustodian(profile, fund);
  const allows: Record<VoucherAction, boolean> = {
    edit: custodian && canAccess(profile, 'JP-PC-VCH', 'update'),
    submit: custodian && canAccess(profile, 'JP-PC-VCH', 'create'),
    uploadAttachment: custodian && canAccess(profile, 'JP-PC-VCH', 'update'),
    deleteAttachment: custodian && canAccess(profile, 'JP-PC-VCH', 'update'),
    void: canAccess(profile, 'JP-PC-VCH', 'delete'),
    approve:
      canAccess(profile, 'JP-PC-APR', 'update') &&
      (!isCreator(profile, voucher) || fund.singleUserOverride),
    reject:
      canAccess(profile, 'JP-PC-APR', 'update') &&
      (!isCreator(profile, voucher) || fund.singleUserOverride),
  };
  return voucherActionsFor(voucher.status, voucher.source).filter((action) => allows[action]);
};

export type CountAction = 'submit' | 'approve' | 'reject';
export type ReimbursementAction = 'approve' | 'reject' | 'cancel' | 'disburse';

/** The counter must be someone other than the custodian of the fund. */
export const canCountFund = (profile: PettyCashAccessProfile, fund: { custodianId: string }) =>
  canAccess(profile, 'JP-PC-CNT', 'create') && profile.userId !== fund.custodianId;

/** Only the custodian asks for a replenishment. */
export const canRequestReplenishment = (profile: PettyCashAccessProfile, fund: FundAccessContext) =>
  canAccess(profile, 'JP-PC-RMB', 'create') && isFundCustodian(profile, fund);

export interface CountAccessContext {
  status: CountStatus;
  countedById: string | null;
  custodianId: string;
}

/**
 * A draft is submitted by the counter; a submitted count is decided by an approver who is neither
 * the custodian nor the counter.
 */
export const allowedCountActions = (
  profile: PettyCashAccessProfile,
  count: CountAccessContext
): CountAction[] => {
  if (count.status === 'DRAFT') {
    return count.countedById === profile.userId && canAccess(profile, 'JP-PC-CNT', 'create')
      ? ['submit']
      : [];
  }
  const independent = profile.userId !== count.custodianId && profile.userId !== count.countedById;
  return count.status === 'SUBMITTED' && canAccess(profile, 'JP-PC-APR', 'update') && independent
    ? ['approve', 'reject']
    : [];
};

export interface ReimbursementAccessContext {
  status: ReimbursementStatus;
  submittedById: string | null;
  approvedById: string | null;
}

/**
 * Approve and reject: an approver other than the submitter. Cancel: the replenishment right, before
 * the money is paid out. Disburse: an approved request, by someone who neither submitted nor approved it.
 */
export const allowedReimbursementActions = (
  profile: PettyCashAccessProfile,
  reimbursement: ReimbursementAccessContext
): ReimbursementAction[] => {
  const { status } = reimbursement;
  const actions: ReimbursementAction[] = [];
  const approver = canAccess(profile, 'JP-PC-APR', 'update');

  if (status === 'SUBMITTED' && approver && profile.userId !== reimbursement.submittedById) {
    actions.push('approve', 'reject');
  }
  if (
    (status === 'SUBMITTED' || status === 'APPROVED') &&
    canAccess(profile, 'JP-PC-RMB', 'delete')
  ) {
    actions.push('cancel');
  }
  const independent =
    profile.userId !== reimbursement.submittedById && profile.userId !== reimbursement.approvedById;
  if (status === 'APPROVED' && canAccess(profile, 'JP-PC-DSB', 'update') && independent) {
    actions.push('disburse');
  }
  return actions;
};
