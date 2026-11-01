import type { AccessRole } from './accessRole';
import {
  PERMISSION_TYPES,
  isGranted,
  type MenuPermission,
  type PermissionType,
} from './rolePermissions';

/** What the signed-in user holds. A legacy superadmin holds every right on every menu. */
export interface MyGrants {
  isSuperAdmin: boolean;
  permissions: MenuPermission[];
}

/** Menu holding the user list and user changes. */
export const USER_MENU_ID = 'JP-SETT-UM';
/** Menu holding the role list and role changes. */
export const ROLE_MENU_ID = 'JP-SETT-CT';

/** The role that holds everything; only a Super Admin may hand it out. */
export const SUPER_ADMIN_ROLE_NAME = 'Super Admin';

export const mayDo = (grants: MyGrants, menuId: string, type: PermissionType): boolean =>
  grants.isSuperAdmin || isGranted(grants.permissions, menuId, type);

/** A person may only hand out a right they hold themselves. */
export const canGrantRight = (grants: MyGrants, menuId: string, type: PermissionType): boolean =>
  mayDo(grants, menuId, type);

/** Rights in `wanted` that the person does not hold. */
export const rightsAbove = (
  grants: MyGrants,
  wanted: MenuPermission[]
): Array<{ menuId: string; type: PermissionType }> =>
  wanted.flatMap((entry) =>
    PERMISSION_TYPES.filter(
      (type) => entry[type] && !canGrantRight(grants, entry.menuId, type)
    ).map((type) => ({ menuId: entry.menuId, type }))
  );

export const isSuperAdminRole = (role: Pick<AccessRole, 'name' | 'isDefault'>): boolean =>
  role.isDefault && role.name === SUPER_ADMIN_ROLE_NAME;

/** Why a role cannot be given to a user by the signed-in person, or `null` when it can. */
export type RoleBlock = 'superAdminOnly' | 'aboveYourRights';

export const roleBlockReason = (
  grants: MyGrants,
  role: Pick<AccessRole, 'name' | 'isDefault' | 'permissions'>
): RoleBlock | null => {
  if (grants.isSuperAdmin) return null;
  if (isSuperAdminRole(role)) return 'superAdminOnly';
  return rightsAbove(grants, role.permissions).length > 0 ? 'aboveYourRights' : null;
};

/**
 * Rights a role-edit adds on top of what the role already grants. Only these are checked against the
 * signed-in person; a right the role already had is kept without a check.
 */
export const addedRights = (before: MenuPermission[], after: MenuPermission[]): MenuPermission[] =>
  after.map((entry) => {
    const was = before.find((item) => item.menuId === entry.menuId);
    return {
      menuId: entry.menuId,
      create: entry.create && !was?.create,
      read: entry.read && !was?.read,
      update: entry.update && !was?.update,
      delete: entry.delete && !was?.delete,
    };
  });

/** Combined rights of several roles, per menu (an estimate: the backend does not state the rule). */
export const combineRoles = (roles: Array<Pick<AccessRole, 'permissions'>>): MenuPermission[] => {
  const merged = new Map<string, MenuPermission>();
  roles.forEach((role) =>
    role.permissions.forEach((entry) => {
      const current = merged.get(entry.menuId);
      merged.set(entry.menuId, {
        menuId: entry.menuId,
        create: Boolean(current?.create) || entry.create,
        read: Boolean(current?.read) || entry.read,
        update: Boolean(current?.update) || entry.update,
        delete: Boolean(current?.delete) || entry.delete,
      });
    })
  );
  return [...merged.values()];
};
