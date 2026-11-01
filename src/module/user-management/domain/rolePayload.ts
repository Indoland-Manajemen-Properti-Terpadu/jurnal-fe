export interface MenuAccessRolePermission {
  menuId: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface RolePayload {
  name: string;
  /** Left out when empty: the API refuses an empty string, and on an update leaving it out clears it. */
  description?: string;
  menuAccessRolePermission: MenuAccessRolePermission[];
}
