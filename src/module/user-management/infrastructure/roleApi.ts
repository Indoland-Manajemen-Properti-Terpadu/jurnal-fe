import apiClient from '@/lib/http/apiClient';
import { API_ACCESS_ROLE } from '@/lib/http/endpoints';
import type { AccessRole } from '@/module/user-management/domain/accessRole';
import type { RolePayload } from '@/module/user-management/domain/rolePayload';
import type { AccessRoleDto } from './dto';
import { toAccessRole } from './mappers';

/** All roles, or only the default (`true`) or custom (`false`) ones. */
export const fetchRoles = async (isDefault?: boolean): Promise<AccessRole[]> => {
  const response = await apiClient.get<AccessRoleDto[]>(API_ACCESS_ROLE.GET_ROLE, {
    params: isDefault === undefined ? {} : { isDefault },
  });
  return response.data.map(toAccessRole);
};

export const fetchRole = async (id: string): Promise<AccessRole> =>
  toAccessRole((await apiClient.get<AccessRoleDto>(API_ACCESS_ROLE.ROLE(id))).data);

export const createRole = async (payload: RolePayload): Promise<AccessRole> =>
  toAccessRole((await apiClient.post<AccessRoleDto>(API_ACCESS_ROLE.GET_ROLE, payload)).data);

export const updateRole = async (id: string, payload: RolePayload): Promise<AccessRole> =>
  toAccessRole((await apiClient.patch<AccessRoleDto>(API_ACCESS_ROLE.ROLE(id), payload)).data);

export const deleteRole = async (id: string): Promise<void> => {
  await apiClient.delete(API_ACCESS_ROLE.ROLE(id));
};
