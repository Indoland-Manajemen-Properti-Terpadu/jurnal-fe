import { useEffect, useState } from 'react';
import {
  createInitialPermissions,
  type MenuPermission,
  type PermissionMenu,
} from '@/module/user-management/domain/rolePermissions';
import { fetchMenus } from '@/module/user-management/infrastructure/menuApi';

/** The menus a role can grant access to, with every permission initially off. */
export const useRoleMenus = () => {
  const [menus, setMenus] = useState<PermissionMenu[]>([]);
  const [initialPermissions, setInitialPermissions] = useState<MenuPermission[]>([]);

  useEffect(() => {
    fetchMenus().then((data) => {
      if (data.length > 0) {
        setMenus(data);
        setInitialPermissions(createInitialPermissions(data));
      }
    });
  }, []);

  return { menus, initialPermissions };
};
