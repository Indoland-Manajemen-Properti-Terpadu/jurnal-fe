export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  /** Ids of the access roles held by the user. */
  accessRoleIds: string[];
  /** Older single role field (`user`, `admin`, `superadmin`); a `superadmin` holds every right. */
  legacyRole: string;
  createdAt: string;
}

/** Same shape the API returns, so other features that only need `results` keep working. */
export interface Paginated<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export type UserList = Paginated<ManagedUser>;

export interface UserListParams {
  page: number;
  limit: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  accessRoleIds: string[];
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  isActive?: boolean;
  accessRoleIds?: string[];
  /** Setting a password resets it and signs the user out of every device. */
  password?: string;
}
