import apiClient from '@/lib/http/apiClient';
import { API_ACCESS_ROLE, API_ACCOUNT } from '@/lib/http/endpoints';
import type { AccessRole } from '@/types/accessRole';
import type { AddRolePayload } from '@/module/user-management/domain/rolePayload';

/** All roles, or only the default (`true`) or additional (`false`) ones. */
export const fetchRoles = async (isDefault?: boolean): Promise<AccessRole[]> =>
  (
    await apiClient.get<AccessRole[]>(API_ACCESS_ROLE.GET_ROLE, {
      params: isDefault !== undefined ? { isDefault } : {},
    })
  ).data;

export const createRole = async (data: AddRolePayload): Promise<unknown> =>
  (await apiClient.post(API_ACCOUNT.POST_ADD_ROLE, data)).data;
