export type AccessRole = {
  permissions: string;
  id: string;
  name: string;
  menuAccessRolePermission: MenuAccessRolePermission[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  description: string;
};

export type MenuAccessRolePermission = {
  id: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  createdAt: Date;
  updatedAt: Date;
  menu?: Menu;
};

export type Menu = {
  id: string;
  menuId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  parentMenuId?: string;
};
