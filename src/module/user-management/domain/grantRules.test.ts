import type { AccessRole } from './accessRole';
import {
  addedRights,
  combineRoles,
  rightsAbove,
  roleBlockReason,
  type MyGrants,
} from './grantRules';
import type { MenuPermission } from './rolePermissions';

const right = (
  menuId: string,
  flags: Partial<Omit<MenuPermission, 'menuId'>> = {}
): MenuPermission => ({
  menuId,
  create: false,
  read: false,
  update: false,
  delete: false,
  ...flags,
});

const me: MyGrants = {
  isSuperAdmin: false,
  permissions: [right('JP-SALES', { read: true, create: true })],
};

const role = (over: Partial<AccessRole>): AccessRole => ({
  id: 'r1',
  name: 'Kasir',
  description: '',
  isDefault: false,
  permissions: [],
  ...over,
});

describe('rightsAbove', () => {
  it('lists rights the person does not hold', () => {
    expect(
      rightsAbove(me, [
        right('JP-SALES', { read: true, delete: true }),
        right('JP-GL', { read: true }),
      ])
    ).toEqual([
      { menuId: 'JP-SALES', type: 'delete' },
      { menuId: 'JP-GL', type: 'read' },
    ]);
  });

  it('lets a superadmin grant anything', () => {
    expect(
      rightsAbove({ isSuperAdmin: true, permissions: [] }, [right('JP-GL', { delete: true })])
    ).toEqual([]);
  });
});

describe('roleBlockReason', () => {
  it('allows a role within the person’s rights', () => {
    expect(
      roleBlockReason(me, role({ permissions: [right('JP-SALES', { read: true })] }))
    ).toBeNull();
  });

  it('blocks a role above the person’s rights', () => {
    expect(roleBlockReason(me, role({ permissions: [right('JP-GL', { read: true })] }))).toBe(
      'aboveYourRights'
    );
  });

  it('keeps Super Admin for a Super Admin', () => {
    const superAdmin = role({ name: 'Super Admin', isDefault: true });
    expect(roleBlockReason(me, superAdmin)).toBe('superAdminOnly');
    expect(roleBlockReason({ isSuperAdmin: true, permissions: [] }, superAdmin)).toBeNull();
  });
});

describe('addedRights', () => {
  it('keeps only rights that are new', () => {
    const added = addedRights(
      [right('JP-SALES', { read: true })],
      [right('JP-SALES', { read: true, update: true }), right('JP-GL', { read: true })]
    );

    expect(added).toEqual([right('JP-SALES', { update: true }), right('JP-GL', { read: true })]);
  });
});

describe('combineRoles', () => {
  it('merges rights per menu', () => {
    const merged = combineRoles([
      role({ permissions: [right('JP-SALES', { read: true })] }),
      role({ permissions: [right('JP-SALES', { delete: true }), right('JP-GL', { read: true })] }),
    ]);

    expect(merged).toEqual([
      right('JP-SALES', { read: true, delete: true }),
      right('JP-GL', { read: true }),
    ]);
  });
});
