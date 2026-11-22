import apiClient from '@/lib/http/apiClient';
import { toApiError } from '@/lib/http/apiError';

export interface MenuRights {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

interface MyPermissionsDto {
  role?: string;
  permissions?: Array<{
    menuId: string;
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  }>;
}

const NONE: MenuRights = { create: false, read: false, update: false, delete: false };
const ALL: MenuRights = { create: true, read: true, update: true, delete: true };

/** What the signed-in person may do on one menu (`GET /v1/users/me/permissions`). A superadmin may do everything. */
export const fetchMenuRights = async (menuId: string): Promise<MenuRights> => {
  try {
    const { data } = await apiClient.get<MyPermissionsDto>('/v1/users/me/permissions');
    if (data.role === 'superadmin') return ALL;
    const found = data.permissions?.find((item) => item.menuId === menuId);
    return found
      ? {
          create: Boolean(found.create),
          read: Boolean(found.read),
          update: Boolean(found.update),
          delete: Boolean(found.delete),
        }
      : NONE;
  } catch (error) {
    throw toApiError(error);
  }
};
