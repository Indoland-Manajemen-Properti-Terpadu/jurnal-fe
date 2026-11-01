import type { MenuAccessRolePermission, RolePayload } from './rolePayload';

export type PermissionType = 'read' | 'create' | 'update' | 'delete';

export const PERMISSION_TYPES: PermissionType[] = ['read', 'create', 'update', 'delete'];

/** Letter used for each permission in the catalog (`enabled`) and in audit snapshots, in this order. */
const LETTER_ORDER: Array<[string, PermissionType]> = [
  ['c', 'create'],
  ['r', 'read'],
  ['u', 'update'],
  ['d', 'delete'],
];

export interface PermissionMenu {
  menuId: string;
  name: string;
  /** Letters of the permissions the menu supports: c, r, u, d. */
  enabled: string;
  description?: string;
  /** What each permission means for this menu. */
  actions?: Partial<Record<PermissionType, string>>;
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

/** Start from the blank matrix and switch on what an existing role already grants. */
export const applyRolePermissions = (
  menus: PermissionMenu[],
  granted: MenuPermission[]
): MenuPermission[] =>
  createInitialPermissions(menus).map((entry) => {
    const existing = granted.find((item) => item.menuId === entry.menuId);
    return existing ? { ...entry, ...existing } : entry;
  });

/** Every menu holds its own rights: a submenu is only grouped under its parent, not tied to it. */
export const setPermission = (
  permissions: MenuPermission[],
  menuId: string,
  type: PermissionType,
  checked: boolean
): MenuPermission[] =>
  permissions.map((entry) => (entry.menuId === menuId ? { ...entry, [type]: checked } : entry));

/** Switch one permission on or off for every menu that supports it and that `canChange` allows. */
export const setColumnPermission = (
  menus: PermissionMenu[],
  permissions: MenuPermission[],
  type: PermissionType,
  checked: boolean,
  canChange: (menuId: string) => boolean = () => true
): MenuPermission[] => {
  const settable = new Set(
    flattenMenus(menus)
      .filter((menu) => supportsPermission(menu, type) && canChange(menu.menuId))
      .map((menu) => menu.menuId)
  );
  return permissions.map((entry) =>
    settable.has(entry.menuId) ? { ...entry, [type]: checked } : entry
  );
};

/** Whether a permission is on for a menu. */
export const isGranted = (permissions: MenuPermission[], menuId: string, type: PermissionType) =>
  permissions.find((entry) => entry.menuId === menuId)?.[type] === true;

/** Menus (parents and submenus, flat) so callers can look a menu up by id. */
export const flattenMenus = (menus: PermissionMenu[]): PermissionMenu[] =>
  menus.flatMap((menu) => [menu, ...(menu.menus ?? [])]);

/** Keeps only what the catalog says the menu supports, so the API never gets an unsupported right. */
const toApiPermission = (
  entry: MenuPermission,
  catalog: Map<string, PermissionMenu>
): MenuAccessRolePermission => {
  const menu = catalog.get(entry.menuId);
  const allowed = (type: PermissionType) =>
    entry[type] && (menu ? supportsPermission(menu, type) : true);
  return {
    menuId: entry.menuId,
    create: allowed('create'),
    read: allowed('read'),
    update: allowed('update'),
    delete: allowed('delete'),
  };
};

/** Menus with no right at all are left out: a menu that is not sent grants nothing. */
export const buildRolePayload = (
  menus: PermissionMenu[],
  name: string,
  description: string,
  permissions: MenuPermission[]
): RolePayload => {
  const catalog = new Map(flattenMenus(menus).map((menu) => [menu.menuId, menu]));
  const note = description.trim();
  return {
    name: name.trim(),
    ...(note !== '' && { description: note }),
    menuAccessRolePermission: permissions
      .map((entry) => toApiPermission(entry, catalog))
      .filter((entry) => entry.create || entry.read || entry.update || entry.delete),
  };
};

/** `{ create, read }` -> `'cr'`: the letters in the fixed c, r, u, d order. */
export const permissionLetters = (
  right: Partial<Record<PermissionType, boolean>> | undefined
): string =>
  LETTER_ORDER.filter(([, type]) => right?.[type])
    .map(([letter]) => letter)
    .join('');

/** `'cr'` -> the permission types it stands for. Unknown letters are ignored. */
export const permissionsFromLetters = (letters: string): PermissionType[] =>
  LETTER_ORDER.filter(([letter]) => letters.includes(letter)).map(([, type]) => type);

/** Menus of a role that grant at least one permission. */
export const grantedMenus = (permissions: MenuPermission[]): MenuPermission[] =>
  permissions.filter((entry) => entry.create || entry.read || entry.update || entry.delete);
