import { toMyAccess, toProfile } from './profileMapper';

describe('toProfile', () => {
  it('reads populated roles and the site code', () => {
    const profile = toProfile({
      id: 'u1',
      name: 'Staff',
      email: 's@x.id',
      role: 'user',
      isActive: true,
      isEmailVerified: false,
      site: { id: 's1', name: 'Demo', external_site_id: '991276' },
      accessRole: [{ id: 'r1', name: 'Kasir', description: 'Mengelola kas' }, 'r2'],
    });

    expect(profile.roles).toEqual([{ id: 'r1', name: 'Kasir', description: 'Mengelola kas' }]);
    expect(profile.site).toEqual({ id: 's1', name: 'Demo', code: '991276' });
  });

  it('treats a missing active flag as active and a legacy superadmin without roles as normal data', () => {
    const profile = toProfile({
      id: 'u1',
      name: 'A',
      email: 'a@x.id',
      role: 'superadmin',
      accessRole: [],
    });

    expect(profile.isActive).toBe(true);
    expect(profile.roles).toEqual([]);
    expect(profile.site).toBeUndefined();
  });
});

describe('toMyAccess', () => {
  it('marks a superadmin and keeps the menu names', () => {
    const access = toMyAccess({
      role: 'superadmin',
      permissions: [{ menuId: 'JP-SALES', name: 'Sales', read: true }],
    });

    expect(access.isSuperAdmin).toBe(true);
    expect(access.menus).toEqual([
      {
        menuId: 'JP-SALES',
        name: 'Sales',
        read: true,
        create: false,
        update: false,
        delete: false,
      },
    ]);
  });
});
