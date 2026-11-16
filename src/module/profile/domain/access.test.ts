import {
  canEditOwnDetails,
  hasMenuRight,
  rightsOf,
  splitMenus,
  type MenuRight,
  type MyAccess,
} from './access';

const menu = (
  menuId: string,
  flags: Partial<Omit<MenuRight, 'menuId' | 'name'>> = {}
): MenuRight => ({
  menuId,
  name: menuId,
  read: false,
  create: false,
  update: false,
  delete: false,
  ...flags,
});

const access = (menus: MenuRight[], isSuperAdmin = false): MyAccess => ({ isSuperAdmin, menus });

describe('splitMenus', () => {
  it('separates menus with a right from those without', () => {
    const result = splitMenus(access([menu('A', { read: true }), menu('B')]));

    expect(result.granted.map((item) => item.menuId)).toEqual(['A']);
    expect(result.none.map((item) => item.menuId)).toEqual(['B']);
  });

  it('shows every menu as usable for a superadmin', () => {
    const result = splitMenus(access([menu('A'), menu('B')], true));

    expect(result.granted).toHaveLength(2);
    expect(result.none).toHaveLength(0);
  });
});

describe('rightsOf', () => {
  it('lists the rights in view, create, edit, delete order', () => {
    expect(rightsOf(menu('A', { delete: true, read: true }))).toEqual(['read', 'delete']);
  });
});

describe('canEditOwnDetails', () => {
  it('is false until the rights are known', () => {
    expect(canEditOwnDetails(undefined)).toBe(false);
  });

  it('needs the right to update users, or a superadmin', () => {
    expect(canEditOwnDetails(access([menu('JP-SETT-UM', { read: true })]))).toBe(false);
    expect(canEditOwnDetails(access([menu('JP-SETT-UM', { update: true })]))).toBe(true);
    expect(canEditOwnDetails(access([], true))).toBe(true);
  });
});

describe('hasMenuRight', () => {
  const limited: MyAccess = {
    isSuperAdmin: false,
    menus: [
      {
        menuId: 'JP-CNTCT',
        name: 'Contacts',
        read: true,
        create: false,
        update: false,
        delete: false,
      },
    ],
  };

  it('answers from the menu list', () => {
    expect(hasMenuRight(limited, 'JP-CNTCT', 'read')).toBe(true);
    expect(hasMenuRight(limited, 'JP-CNTCT', 'create')).toBe(false);
    expect(hasMenuRight(limited, 'JP-OTHER', 'read')).toBe(false);
  });

  it('gives a superadmin every right and nobody a right before access loads', () => {
    expect(hasMenuRight({ isSuperAdmin: true, menus: [] }, 'JP-CNTCT', 'create')).toBe(true);
    expect(hasMenuRight(undefined, 'JP-CNTCT', 'read')).toBe(false);
  });
});
