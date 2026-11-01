import type { AccessRole } from '@/module/user-management/domain/accessRole';
import type { AuditEntry, AuditList } from '@/module/user-management/domain/auditLog';
import type { MyGrants } from '@/module/user-management/domain/grantRules';
import type {
  MenuPermission,
  PermissionMenu,
} from '@/module/user-management/domain/rolePermissions';
import type { ManagedUser, Paginated } from '@/module/user-management/domain/userTypes';
import type {
  AccessRoleDto,
  AuditEntryDto,
  MenuDto,
  MyPermissionsDto,
  PaginatedDto,
  RolePermissionDto,
  UserDto,
} from './dto';

const lettersOf = (enabled: MenuDto['enabled']): string =>
  Array.isArray(enabled) ? enabled.join('') : (enabled ?? '');

export const toPermissionMenu = (dto: MenuDto): PermissionMenu => ({
  menuId: dto.menuId,
  name: dto.name,
  enabled: lettersOf(dto.enabled),
  description: dto.description,
  actions: dto.actions,
  menus: dto.menus?.map(toPermissionMenu),
});

const toPermission = (dto: RolePermissionDto): MenuPermission | null => {
  const menuId = dto.menu?.menuId ?? dto.menuId;
  if (!menuId) return null;
  return {
    menuId,
    create: Boolean(dto.create),
    read: Boolean(dto.read),
    update: Boolean(dto.update),
    delete: Boolean(dto.delete),
  };
};

export const toAccessRole = (dto: AccessRoleDto): AccessRole => ({
  id: dto.id,
  name: dto.name,
  description: dto.description ?? '',
  isDefault: Boolean(dto.isDefault),
  permissions: (dto.menuAccessRolePermission ?? []).flatMap((item) => toPermission(item) ?? []),
});

export const toManagedUser = (dto: UserDto): ManagedUser => ({
  id: dto.id,
  name: dto.name ?? '',
  email: dto.email ?? '',
  // An older response may not carry the flag; such a user can still sign in.
  isActive: dto.isActive !== false,
  accessRoleIds: (dto.accessRole ?? []).map((ref) => (typeof ref === 'string' ? ref : ref.id)),
  legacyRole: dto.role ?? 'user',
  createdAt: dto.createdAt ?? '',
});

export const toPaginated = <Dto, T>(
  dto: PaginatedDto<Dto>,
  map: (item: Dto) => T
): Paginated<T> => ({
  results: (dto.results ?? []).map(map),
  page: dto.page ?? 1,
  limit: dto.limit ?? 10,
  totalPages: dto.totalPages ?? 1,
  totalResults: dto.totalResults ?? dto.results?.length ?? 0,
});

const toAuditEntry = (dto: AuditEntryDto): AuditEntry => ({
  id: dto.id,
  actorName: dto.actor?.name ?? '',
  action: dto.action,
  targetType: dto.targetType ?? '',
  targetName: dto.targetName ?? '',
  before: dto.before,
  after: dto.after,
  createdAt: dto.createdAt ?? '',
});

export const toAuditList = (dto: PaginatedDto<AuditEntryDto>): AuditList =>
  toPaginated(dto, toAuditEntry);

/** A legacy `superadmin` holds every right even though the list may show fewer. */
export const toMyGrants = (dto: MyPermissionsDto): MyGrants => ({
  isSuperAdmin: dto.role === 'superadmin',
  permissions: (dto.permissions ?? []).map((item) => ({
    menuId: item.menuId,
    create: Boolean(item.create),
    read: Boolean(item.read),
    update: Boolean(item.update),
    delete: Boolean(item.delete),
  })),
});
