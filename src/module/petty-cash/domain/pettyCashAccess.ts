import {
  voucherActionsFor,
  type VoucherAction,
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
