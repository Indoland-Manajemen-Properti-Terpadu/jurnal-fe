import { useQuery } from '@tanstack/react-query';
import {
  mayDo,
  type MyGrants,
  ROLE_MENU_ID,
  USER_MENU_ID,
} from '@/module/user-management/domain/grantRules';
import type { PermissionType } from '@/module/user-management/domain/rolePermissions';
import { fetchMyGrants, fetchMyId } from '@/module/user-management/infrastructure/myPermissionsApi';
import { retryTransient } from './queryRetry';
import { userManagementKeys } from './userManagementKeys';

const NO_GRANTS: MyGrants = { isSuperAdmin: false, permissions: [] };

export const useMyId = () =>
  useQuery<string, Error>({ queryKey: userManagementKeys.myId, queryFn: fetchMyId });

/** What the signed-in user may do here. Until it loads (or if it fails) nothing is allowed. */
export const useMyGrants = () => {
  const query = useQuery<MyGrants, Error>({
    queryKey: userManagementKeys.myGrants,
    queryFn: fetchMyGrants,
    retry: retryTransient,
    staleTime: 60 * 1000,
  });
  const grants = query.data ?? NO_GRANTS;

  return {
    grants,
    isLoading: query.isLoading,
    /** True once the rights are known; callers that only hide things should not hide before that. */
    isReady: query.isSuccess,
    canRead: (menuId: string) => mayDo(grants, menuId, 'read'),
    /** Any right on any menu, e.g. `can('JP-GL', 'delete')`. */
    can: (menuId: string, type: PermissionType) => mayDo(grants, menuId, type),
    canUsers: (type: PermissionType) => mayDo(grants, USER_MENU_ID, type),
    canRoles: (type: PermissionType) => mayDo(grants, ROLE_MENU_ID, type),
  };
};
