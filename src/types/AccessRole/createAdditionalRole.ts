export type CreateAdditionalRole = {
  name?: string;
  description?: string;
  menuAccessRolePermission?: MenuAccessRolePermission[];
};

export type MenuAccessRolePermission = {
  menuId?: string;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
};
