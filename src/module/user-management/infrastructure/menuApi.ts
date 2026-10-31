import apiClient from '@/lib/http/apiClient';
import type { PermissionMenu } from '@/module/user-management/domain/rolePermissions';

export const fetchMenus = async (): Promise<PermissionMenu[]> => {
  const response = await apiClient.get<PermissionMenu[]>('/v1/menus');
  return response.data;
};
