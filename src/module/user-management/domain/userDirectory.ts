import type { AccessRole } from './accessRole';
import { isSuperAdminRole } from './grantRules';
import { grantedMenus, type MenuPermission } from './rolePermissions';
import type { ManagedUser } from './userTypes';

/** How much a person can do, in one word, so a long list of people can be scanned. */
export type AccessLevel = 'full' | 'readOnly' | 'limited' | 'none';

/** Rights of every role the person holds, summarized. A legacy superadmin holds every right. */
export const accessLevelOf = (
  user: Pick<ManagedUser, 'legacyRole' | 'accessRoleIds'>,
  roles: AccessRole[]
): AccessLevel => {
  if (user.legacyRole === 'superadmin') return 'full';
  const held = roles.filter((role) => user.accessRoleIds.includes(role.id));
  if (held.some(isSuperAdminRole)) return 'full';

  const granted: MenuPermission[] = grantedMenus(held.flatMap((role) => role.permissions));
  if (granted.length === 0) return 'none';
  return granted.every((entry) => !entry.create && !entry.update && !entry.delete)
    ? 'readOnly'
    : 'limited';
};

export interface RoleCount {
  roleId: string;
  name: string;
  count: number;
}

/** Roles that have at least one member, the biggest first (ties by name). */
export const roleCounts = (users: ManagedUser[], roles: AccessRole[]): RoleCount[] =>
  roles
    .map((role) => ({
      roleId: role.id,
      name: role.name,
      count: users.filter((user) => user.accessRoleIds.includes(role.id)).length,
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export interface DirectoryFilter {
  /** `null` lists everyone. */
  roleId: string | null;
  query: string;
}

/** People of a role (or everyone) whose name or e-mail contains the words typed. */
export const filterUsers = (users: ManagedUser[], filter: DirectoryFilter): ManagedUser[] => {
  const query = filter.query.trim().toLowerCase();
  return users.filter((user) => {
    if (filter.roleId && !user.accessRoleIds.includes(filter.roleId)) return false;
    if (!query) return true;
    return `${user.name} ${user.email}`.toLowerCase().includes(query);
  });
};

/** One page of a list, 1-based; a page past the end gives the last one. */
export const pageOf = <T>(items: T[], page: number, size: number): T[] => {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const safe = Math.min(Math.max(page, 1), pages);
  return items.slice((safe - 1) * size, safe * size);
};
