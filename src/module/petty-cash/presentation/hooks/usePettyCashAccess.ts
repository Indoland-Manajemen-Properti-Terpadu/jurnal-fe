import { useMemo } from 'react';
import {
  allowedCountActions,
  allowedReimbursementActions,
  allowedVoucherActions,
  canAccess,
  canCountFund,
  canRequestReplenishment,
  isFundCustodian,
  type CountAccessContext,
  type FundAccessContext,
  type ReimbursementAccessContext,
  type MenuAction,
  type PettyCashMenu,
  type VoucherAccessContext,
} from '@/module/petty-cash/domain/pettyCashAccess';
import { usePettyCashAccessProfile } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

/**
 * What the signed-in user may do in petty cash. Until the profile loads every check answers
 * false, so no action is offered that the server would then refuse.
 */
export const usePettyCashAccess = () => {
  const { data: profile, isLoading, isError, error, refetch } = usePettyCashAccessProfile();

  return useMemo(
    () => ({
      isLoading,
      isError,
      error,
      refetch,
      userId: profile?.userId ?? null,
      can: (menu: PettyCashMenu, action: MenuAction) =>
        profile ? canAccess(profile, menu, action) : false,
      isCustodianOf: (fund: FundAccessContext) =>
        profile ? isFundCustodian(profile, fund) : false,
      voucherActions: (voucher: VoucherAccessContext, fund: FundAccessContext) =>
        profile ? allowedVoucherActions(profile, voucher, fund) : [],
      canCount: (fund: { custodianId: string }) => (profile ? canCountFund(profile, fund) : false),
      canRequestReplenishment: (fund: FundAccessContext) =>
        profile ? canRequestReplenishment(profile, fund) : false,
      countActions: (count: CountAccessContext) =>
        profile ? allowedCountActions(profile, count) : [],
      reimbursementActions: (reimbursement: ReimbursementAccessContext) =>
        profile ? allowedReimbursementActions(profile, reimbursement) : [],
    }),
    [profile, isLoading, isError, error, refetch]
  );
};
