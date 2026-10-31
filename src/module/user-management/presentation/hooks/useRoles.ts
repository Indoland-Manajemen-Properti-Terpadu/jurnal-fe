import { useQuery } from '@tanstack/react-query';
import type { AccessRole } from '@/types/AccessRole/getAccessRole';
import { fetchRoles } from '@/module/user-management/infrastructure/roleApi';

export const useRoles = (isDefault?: boolean, options = {}) =>
  useQuery<AccessRole[]>({
    queryKey: ['roles', isDefault],
    queryFn: () => fetchRoles(isDefault),
    ...options,
  });

export const useDefaultRoles = (options = {}) =>
  useQuery<AccessRole[]>({
    queryKey: ['default_role'],
    queryFn: () => fetchRoles(true),
    ...options,
  });
