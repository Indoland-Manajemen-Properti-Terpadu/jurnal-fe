export interface ProfileRoleDto {
  id: string;
  name: string;
  description?: string;
}

export interface ProfileDto {
  id: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  site?: { id: string; name: string; external_site_id?: string };
  /** Populated roles; an id string is tolerated and skipped. */
  accessRole?: Array<ProfileRoleDto | string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MyPermissionsDto {
  role?: string;
  permissions?: Array<{
    menuId: string;
    name?: string;
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  }>;
}
