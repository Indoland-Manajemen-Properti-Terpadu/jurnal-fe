import type { PettyCashMenu } from '@/module/petty-cash/domain/pettyCashAccess';

/**
 * Approval stages the backend reports in `pendingApprovers` of a count or replenishment. A property
 * management site goes BM then CF; any other site has one FINANCE stage. The first entry is the
 * stage being waited for; the rest are still to come.
 */
export type ApprovalLevel = 'FINANCE' | 'BM' | 'CF';

export interface PendingApprover {
  /** Kept as received: a level this app does not know is shown by its label and offers no action. */
  level: string;
  label: string;
}

/** Menu right that decides who may approve at each stage (`JP-PC-APR` is the single finance stage). */
export const APPROVAL_MENU: Record<ApprovalLevel, PettyCashMenu> = {
  FINANCE: 'JP-PC-APR',
  BM: 'JP-PC-APR-BM',
  CF: 'JP-PC-APR-CF',
};

export const isKnownApprovalLevel = (level: string): level is ApprovalLevel =>
  Object.prototype.hasOwnProperty.call(APPROVAL_MENU, level);

/** The stage being waited for now, or null when nothing is pending. */
export const activeApprover = (pending: PendingApprover[]): PendingApprover | null =>
  pending[0] ?? null;

/**
 * Menu the signed-in user needs to approve now. With no `pendingApprovers` (a backend that does not
 * send them) the single finance right applies. An unknown stage has no menu, so nothing is offered.
 */
export const approvalMenuFor = (pending: PendingApprover[]): PettyCashMenu | null => {
  const active = activeApprover(pending);
  if (!active) return APPROVAL_MENU.FINANCE;
  return isKnownApprovalLevel(active.level) ? APPROVAL_MENU[active.level] : null;
};
