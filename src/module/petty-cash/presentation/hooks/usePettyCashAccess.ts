import { useMemo } from 'react';
import {
  allowedVoucherActions,
  canAccess,
  isFundCustodian,
  type FundAccessContext,
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
  const { data: profile, isLoading, isError } = usePettyCashAccessProfile();

  return useMemo(
    () => ({
      isLoading,
      isError,
      userId: profile?.userId ?? null,
      can: (menu: PettyCashMenu, action: MenuAction) =>
        profile ? canAccess(profile, menu, action) : false,
      isCustodianOf: (fund: FundAccessContext) =>
        profile ? isFundCustodian(profile, fund) : false,
      voucherActions: (voucher: VoucherAccessContext, fund: FundAccessContext) =>
        profile ? allowedVoucherActions(profile, voucher, fund) : [],
    }),
    [profile, isLoading, isError]
  );
};
