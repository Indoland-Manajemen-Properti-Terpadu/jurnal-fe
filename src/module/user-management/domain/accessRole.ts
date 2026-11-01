import type { MenuPermission } from './rolePermissions';

export interface AccessRole {
  id: string;
  name: string;
  description: string;
  /** Default roles are shared by every site and cannot be changed or deleted. */
  isDefault: boolean;
  /** One entry per menu the role has a row for; a menu with no entry grants nothing. */
  permissions: MenuPermission[];
}

/** Short name of the role used where only an id is known (a user's role list). */
export const roleNameById = (roles: AccessRole[], id: string): string | undefined =>
  roles.find((role) => role.id === id)?.name;
