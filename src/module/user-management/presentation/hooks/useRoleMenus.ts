import { useQuery } from '@tanstack/react-query';
import type { PermissionMenu } from '@/module/user-management/domain/rolePermissions';
import { fetchMenus } from '@/module/user-management/infrastructure/menuApi';
import { retryTransient } from './queryRetry';
import { userManagementKeys } from './userManagementKeys';

/** The menus a role can grant access to, with what each one supports. */
export const useRoleMenus = () =>
  useQuery<PermissionMenu[], Error>({
    queryKey: userManagementKeys.menus,
    queryFn: fetchMenus,
    retry: retryTransient,
    staleTime: 5 * 60 * 1000,
  });
