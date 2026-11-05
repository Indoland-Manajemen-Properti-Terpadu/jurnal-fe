import { useMemo } from 'react';
import {
  canAccess,
  canReadPurchasing,
  type MenuAction,
  type PurchaseMenu,
} from '@/module/purchases/domain/purchaseAccess';
import { usePurchaseAccessProfile } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

/**
 * What the signed-in user may do in purchasing. Until the rights load every check answers false,
 * so no action is offered that the server would then refuse.
 */
export const usePurchaseAccess = () => {
  const { data: profile, isLoading, isError, refetch } = usePurchaseAccessProfile();
  return useMemo(
    () => ({
      isLoading,
      isError,
      refetch,
      can: (menu: PurchaseMenu, action: MenuAction) =>
        profile ? canAccess(profile, menu, action) : false,
      canRead: () => (profile ? canReadPurchasing(profile) : false),
    }),
    [profile, isLoading, isError, refetch]
  );
};
