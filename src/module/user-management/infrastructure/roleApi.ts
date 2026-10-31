import { get, post } from '@/lib/http/apiClient';
import { API_ACCESS_ROLE, API_ACCOUNT } from '@/lib/http/endpoints';
import type { AccessRole } from '@/types/accessRole';
import type { AddRolePayload } from '@/module/user-management/domain/rolePayload';

/** All roles, or only the default (`true`) or additional (`false`) ones. */
export const fetchRoles = (isDefault?: boolean): Promise<AccessRole[]> =>
  get(API_ACCESS_ROLE.GET_ROLE, isDefault !== undefined ? { isDefault } : {});

export const createRole = (data: AddRolePayload) => post(API_ACCOUNT.POST_ADD_ROLE, data);
