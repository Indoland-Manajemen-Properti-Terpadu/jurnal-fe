export interface AddRolePayload {
  name?: string;
  menuAccessRolePermission?: MenuAccessRolePermission[];
}

export interface MenuAccessRolePermission {
  menuID?: string;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
}
