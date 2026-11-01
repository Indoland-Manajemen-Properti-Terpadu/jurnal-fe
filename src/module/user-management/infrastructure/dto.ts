/** Shapes as the API sends them; mapped to domain types in `mappers.ts`. */

export interface MenuDto {
  menuId: string;
  name: string;
  /** Either a string of letters ("crud") or a list of letters, depending on the endpoint version. */
  enabled?: string | string[];
  description?: string;
  actions?: { create?: string; read?: string; update?: string; delete?: string };
  menus?: MenuDto[];
}

export interface RolePermissionDto {
  menu?: { menuId: string };
  menuId?: string;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface AccessRoleDto {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  menuAccessRolePermission?: RolePermissionDto[];
}

/** A user's role is an id in the list and a full role once the API populates it. */
export type UserRoleRefDto = string | { id: string };

export interface UserDto {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  accessRole?: UserRoleRefDto[];
  createdAt?: string;
}

export interface PaginatedDto<T> {
  results?: T[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalResults?: number;
}

export interface AuditEntryDto {
  id: string;
  actor?: { id?: string; name?: string };
  action: string;
  targetType?: string;
  targetName?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt?: string;
}

export interface MyPermissionsDto {
  role?: string;
  permissions?: Array<{
    menuId: string;
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  }>;
}
