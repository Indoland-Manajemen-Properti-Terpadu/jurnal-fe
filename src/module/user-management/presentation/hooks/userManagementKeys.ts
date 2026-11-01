import type { AuditFilters } from '@/module/user-management/domain/auditLog';
import type { UserListParams } from '@/module/user-management/domain/userTypes';

const root = ['user-management'] as const;

export const userManagementKeys = {
  all: root,
  users: (params?: Partial<UserListParams>) => [...root, 'users', params ?? {}] as const,
  usersRoot: [...root, 'users'] as const,
  roles: (isDefault?: boolean) => [...root, 'roles', isDefault ?? 'all'] as const,
  role: (id: string) => [...root, 'role', id] as const,
  rolesRoot: [...root, 'roles'] as const,
  menus: [...root, 'menus'] as const,
  myGrants: [...root, 'my-grants'] as const,
  myId: [...root, 'my-id'] as const,
  audit: (page: number, filters: AuditFilters) => [...root, 'audit', page, filters] as const,
  auditRoot: [...root, 'audit'] as const,
};
