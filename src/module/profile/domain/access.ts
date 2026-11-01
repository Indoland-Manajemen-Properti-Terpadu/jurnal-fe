export type RightType = 'read' | 'create' | 'update' | 'delete';

export const RIGHT_TYPES: RightType[] = ['read', 'create', 'update', 'delete'];

export interface MenuRight {
  menuId: string;
  name: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface MyAccess {
  /** A legacy superadmin holds every right even where the list shows fewer. */
  isSuperAdmin: boolean;
  menus: MenuRight[];
}

/** Menu that gates changing other people's name and email. */
export const USER_MENU_ID = 'JP-SETT-UM';

export const hasAnyRight = (menu: MenuRight): boolean =>
  menu.read || menu.create || menu.update || menu.delete;

export const rightsOf = (menu: MenuRight): RightType[] => RIGHT_TYPES.filter((type) => menu[type]);

/** Menus the person can use, and the ones with no right at all. */
export const splitMenus = (access: MyAccess): { granted: MenuRight[]; none: MenuRight[] } => ({
  granted: access.isSuperAdmin ? access.menus : access.menus.filter(hasAnyRight),
  none: access.isSuperAdmin ? [] : access.menus.filter((menu) => !hasAnyRight(menu)),
});

/**
 * The API only lets name and email change through the user-management call, which needs the
 * right to update users. Everyone else sees them read-only.
 */
export const canEditOwnDetails = (access: MyAccess | undefined): boolean =>
  access !== undefined &&
  (access.isSuperAdmin || access.menus.some((menu) => menu.menuId === USER_MENU_ID && menu.update));
