import { toAccessRole, toManagedUser, toMyGrants, toPaginated, toPermissionMenu } from './mappers';

describe('toPermissionMenu', () => {
  it('accepts enabled as a string or a list of letters', () => {
    expect(toPermissionMenu({ menuId: 'A', name: 'A', enabled: ['c', 'r'] }).enabled).toBe('cr');
    expect(toPermissionMenu({ menuId: 'A', name: 'A', enabled: 'cru' }).enabled).toBe('cru');
    expect(toPermissionMenu({ menuId: 'A', name: 'A' }).enabled).toBe('');
  });

  it('maps submenus', () => {
    const menu = toPermissionMenu({
      menuId: 'P',
      name: 'P',
      enabled: 'crud',
      menus: [{ menuId: 'C', name: 'C', enabled: ['r'] }],
    });

    expect(menu.menus).toEqual([
      {
        menuId: 'C',
        name: 'C',
        enabled: 'r',
        description: undefined,
        actions: undefined,
        menus: undefined,
      },
    ]);
  });
});

describe('toAccessRole', () => {
  it('reads the menu id from the nested menu and defaults missing flags to false', () => {
    const role = toAccessRole({
      id: '1',
      name: 'Kasir',
      isDefault: false,
      menuAccessRolePermission: [{ menu: { menuId: 'JP-SALES' }, read: true }, {}],
    });

    expect(role).toEqual({
      id: '1',
      name: 'Kasir',
      description: '',
      isDefault: false,
      permissions: [
        { menuId: 'JP-SALES', create: false, read: true, update: false, delete: false },
      ],
    });
  });
});

describe('toManagedUser', () => {
  it('takes role ids from strings or populated roles and treats a missing flag as active', () => {
    expect(
      toManagedUser({ id: 'u', accessRole: ['a', { id: 'b' }], name: 'N', email: 'e@x.id' })
    ).toMatchObject({ accessRoleIds: ['a', 'b'], isActive: true, legacyRole: 'user' });
    expect(toManagedUser({ id: 'u', isActive: false }).isActive).toBe(false);
  });
});

describe('toPaginated', () => {
  it('fills the paging defaults', () => {
    expect(toPaginated({ results: [1, 2] }, (n: number) => n * 2)).toEqual({
      results: [2, 4],
      page: 1,
      limit: 10,
      totalPages: 1,
      totalResults: 2,
    });
  });
});

describe('toMyGrants', () => {
  it('marks a legacy superadmin', () => {
    expect(toMyGrants({ role: 'superadmin', permissions: [] }).isSuperAdmin).toBe(true);
    expect(toMyGrants({ role: 'user', permissions: [] }).isSuperAdmin).toBe(false);
  });
});
