import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { API_ACCESS_ROLE } from '@/services/endpoint';
import { AccessRole } from '@/types/AccessRole/getAccessRole';

export const GetRoles = (isDefault?: boolean, options = {}) =>
  useQuery<AccessRole[]>({
    queryKey: ['roles', isDefault],
    queryFn: async () => {
      const params = isDefault !== undefined ? { isDefault } : {};
      const result = await get(API_ACCESS_ROLE.GET_ROLE, params);
      return result;
    },
    ...options,
  });

export const GetDefaultRole = (options = {}) =>
  useQuery<AccessRole[]>({
    queryKey: ['default_role'],
    queryFn: async () => {
      const result = await get(API_ACCESS_ROLE.GET_ROLE, { isDefault: true });
      return result;
    },
    ...options,
  });
