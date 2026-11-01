import apiClient from '@/lib/http/apiClient';
import { API_MENUS } from '@/lib/http/endpoints';
import type { PermissionMenu } from '@/module/user-management/domain/rolePermissions';
import type { MenuDto } from './dto';
import { toPermissionMenu } from './mappers';

export const fetchMenus = async (): Promise<PermissionMenu[]> =>
  (await apiClient.get<MenuDto[]>(API_MENUS.GET_MENUS)).data.map(toPermissionMenu);
