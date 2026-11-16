import { useMyGrants } from '@/module/user-management';

/** Menu "Tutup Buku & Lock Period" of the server catalog. */
export const PERIOD_MENU_ID = 'JP-GL-PC';

/**
 * What the signed-in user may do with periods. `delete` also covers reopening a closing.
 * Until the rights load nothing is hidden for good: `isReady` tells the page when to decide.
 */
export const usePeriodAccess = () => {
  const { can, isReady, isLoading } = useMyGrants();
  return {
    isReady,
    isLoading,
    canRead: can(PERIOD_MENU_ID, 'read'),
    canCreate: can(PERIOD_MENU_ID, 'create'),
    canUpdate: can(PERIOD_MENU_ID, 'update'),
    canDelete: can(PERIOD_MENU_ID, 'delete'),
  };
};

export type PeriodAccess = ReturnType<typeof usePeriodAccess>;
