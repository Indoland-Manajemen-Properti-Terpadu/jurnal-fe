export interface AllUserModel {
  results?: Result[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalResults?: number;
}

export interface Result {
  name?: string;
  email?: string;
  role?: string;
  site?: Site;
  accessRole?: AccessRole[];
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  id?: string;
}

export interface Site {
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  id?: string;
}

export interface AccessRole {
  id?: string;
  name?: string;
  menuAccessRolePermission?: MenuAccessRolePermission[];
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuAccessRolePermission {
  id?: string;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  menu?: Site;
}

// User Detail
export interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  accessRole: any[];
  isEmailVerified: boolean;
  site: Site;
  createdAt: Date;
  updatedAt: Date;
}
