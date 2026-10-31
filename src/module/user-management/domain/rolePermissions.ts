import type { AddRolePayload, MenuAccessRolePermission } from './rolePayload';

export type PermissionType = 'read' | 'create' | 'update' | 'delete';

export interface PermissionMenu {
  menuId: string;
  name: string;
  /** Letters of the permissions the menu supports: r, c, u, d. */
  enabled: string;
  menus?: PermissionMenu[];
}

export interface MenuPermission {
  menuId: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

/** A menu supports a permission when its enabled letters contain the permission's first letter. */
export const supportsPermission = (menu: Pick<PermissionMenu, 'enabled'>, type: PermissionType) =>
  menu.enabled.includes(type.substring(0, 1));

const blank = (menuId: string): MenuPermission => ({
  menuId,
  create: false,
  read: false,
  update: false,
  delete: false,
});

/** One entry per menu and per submenu, every permission off. */
export const createInitialPermissions = (menus: PermissionMenu[]): MenuPermission[] =>
  menus.flatMap((menu) => [
    blank(menu.menuId),
    ...(menu.menus ?? []).map((sub) => blank(sub.menuId)),
  ]);

const replace = (
  permissions: MenuPermission[],
  menuId: string,
  type: PermissionType,
  value: boolean
): MenuPermission[] =>
  permissions.map((entry) => (entry.menuId === menuId ? { ...entry, [type]: value } : entry));

/**
 * A submenu or standalone menu checkbox was toggled. A parent follows its children: ticked when at
 * least one child has the permission, unticked when none has it.
 */
export const toggleChildPermission = (
  menus: PermissionMenu[],
  permissions: MenuPermission[],
  menuId: string,
  type: PermissionType
): MenuPermission[] => {
  const current = permissions.find((entry) => entry.menuId === menuId);
  const updated = replace(permissions, menuId, type, !current?.[type]);
  const parent = menus.find((menu) => menu.menus?.some((sub) => sub.menuId === menuId));
  if (!parent) return updated;

  const anyChildOn = (parent.menus ?? []).some(
    (sub) => updated.find((entry) => entry.menuId === sub.menuId)?.[type] === true
  );
  return replace(updated, parent.menuId, type, anyChildOn);
};

/** A parent checkbox was set: the parent and the children that support the permission follow. */
export const setMenuPermission = (
  menus: PermissionMenu[],
  permissions: MenuPermission[],
  menuId: string,
  type: PermissionType,
  checked: boolean
): MenuPermission[] => {
  const parent = menus.find((menu) => menu.menuId === menuId);
  const children = parent?.menus ?? [];
  const followers = new Set(
    children.filter((sub) => supportsPermission(sub, type)).map((sub) => sub.menuId)
  );

  return permissions.map((entry) =>
    entry.menuId === menuId || followers.has(entry.menuId) ? { ...entry, [type]: checked } : entry
  );
};

export const buildRolePayload = (name: string, permissions: MenuPermission[]): AddRolePayload => ({
  name,
  menuAccessRolePermission: permissions as MenuAccessRolePermission[],
});
