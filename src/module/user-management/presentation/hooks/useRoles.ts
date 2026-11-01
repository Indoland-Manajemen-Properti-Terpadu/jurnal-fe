import { useQuery } from '@tanstack/react-query';
import type { AccessRole } from '@/module/user-management/domain/accessRole';
import { fetchRole, fetchRoles } from '@/module/user-management/infrastructure/roleApi';
import { retryTransient } from './queryRetry';
import { userManagementKeys } from './userManagementKeys';

export const useRoles = (isDefault?: boolean) =>
  useQuery<AccessRole[], Error>({
    queryKey: userManagementKeys.roles(isDefault),
    queryFn: () => fetchRoles(isDefault),
    retry: retryTransient,
  });

export const useRole = (id: string | undefined) =>
  useQuery<AccessRole, Error>({
    queryKey: userManagementKeys.role(id ?? ''),
    queryFn: () => fetchRole(id as string),
    retry: retryTransient,
    enabled: Boolean(id),
  });
