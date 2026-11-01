import type { MenuRight, MyAccess } from '../domain/access';
import type { Profile, ProfileRole } from '../domain/profile';
import type { MyPermissionsDto, ProfileDto } from './profileDto';

const toRoles = (refs: ProfileDto['accessRole']): ProfileRole[] =>
  (refs ?? []).flatMap((ref) =>
    typeof ref === 'string'
      ? []
      : [{ id: ref.id, name: ref.name, description: ref.description ?? '' }]
  );

export const toProfile = (dto: ProfileDto): Profile => ({
  id: dto.id,
  name: dto.name ?? '',
  email: dto.email ?? '',
  role: dto.role ?? 'user',
  // An older response may not carry the flag; such a user can still sign in.
  isActive: dto.isActive !== false,
  isEmailVerified: Boolean(dto.isEmailVerified),
  site: dto.site
    ? { id: dto.site.id, name: dto.site.name, code: dto.site.external_site_id }
    : undefined,
  roles: toRoles(dto.accessRole),
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toMyAccess = (dto: MyPermissionsDto): MyAccess => ({
  isSuperAdmin: dto.role === 'superadmin',
  menus: (dto.permissions ?? []).map(
    (item): MenuRight => ({
      menuId: item.menuId,
      name: item.name ?? item.menuId,
      read: Boolean(item.read),
      create: Boolean(item.create),
      update: Boolean(item.update),
      delete: Boolean(item.delete),
    })
  ),
});
