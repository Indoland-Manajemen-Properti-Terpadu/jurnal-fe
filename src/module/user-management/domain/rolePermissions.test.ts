import {
  buildRolePayload,
  createInitialPermissions,
  setMenuPermission,
  supportsPermission,
  toggleChildPermission,
  type PermissionMenu,
} from './rolePermissions';

const menus: PermissionMenu[] = [
  {
    menuId: 'journal',
    name: 'Journal',
    enabled: 'rcud',
    menus: [
      { menuId: 'journal-list', name: 'List', enabled: 'rcud' },
      { menuId: 'journal-report', name: 'Report', enabled: 'r' },
    ],
  },
  { menuId: 'dashboard', name: 'Dashboard', enabled: 'r' },
];

const flags = (permissions: ReturnType<typeof createInitialPermissions>, menuId: string) => {
  const { create, read, update, delete: remove } = permissions.find((p) => p.menuId === menuId)!;
  return { read, create, update, delete: remove };
};

describe('createInitialPermissions', () => {
  it('lists every menu and submenu with all permissions off', () => {
    const permissions = createInitialPermissions(menus);

    expect(permissions.map((p) => p.menuId)).toEqual([
      'journal',
      'journal-list',
      'journal-report',
      'dashboard',
    ]);
    expect(permissions.every((p) => !p.read && !p.create && !p.update && !p.delete)).toBe(true);
  });
});

describe('supportsPermission', () => {
  it('checks the first letter of the permission against the enabled letters', () => {
    expect(supportsPermission(menus[1], 'read')).toBe(true);
    expect(supportsPermission(menus[1], 'create')).toBe(false);
    expect(supportsPermission(menus[0], 'delete')).toBe(true);
  });
});

describe('toggleChildPermission', () => {
  it('ticks the parent when a child is ticked', () => {
    const next = toggleChildPermission(
      menus,
      createInitialPermissions(menus),
      'journal-list',
      'read'
    );

    expect(flags(next, 'journal-list').read).toBe(true);
    expect(flags(next, 'journal').read).toBe(true);
  });

  it('unticks the parent when the last ticked child is unticked', () => {
    let next = toggleChildPermission(
      menus,
      createInitialPermissions(menus),
      'journal-list',
      'read'
    );
    next = toggleChildPermission(menus, next, 'journal-list', 'read');

    expect(flags(next, 'journal-list').read).toBe(false);
    expect(flags(next, 'journal').read).toBe(false);
  });

  it('keeps the parent ticked while another child is still ticked', () => {
    let next = toggleChildPermission(
      menus,
      createInitialPermissions(menus),
      'journal-list',
      'read'
    );
    next = toggleChildPermission(menus, next, 'journal-report', 'read');
    next = toggleChildPermission(menus, next, 'journal-list', 'read');

    expect(flags(next, 'journal-report').read).toBe(true);
    expect(flags(next, 'journal').read).toBe(true);
  });

  it('toggles a menu without a parent on its own and leaves the others alone', () => {
    const initial = createInitialPermissions(menus);
    const next = toggleChildPermission(menus, initial, 'dashboard', 'read');

    expect(flags(next, 'dashboard').read).toBe(true);
    expect(flags(next, 'journal').read).toBe(false);
  });

  it('does not change the permissions it was given', () => {
    const initial = createInitialPermissions(menus);
    const snapshot = JSON.stringify(initial);

    toggleChildPermission(menus, initial, 'journal-list', 'read');

    expect(JSON.stringify(initial)).toBe(snapshot);
  });
});

describe('setMenuPermission', () => {
  it('sets a parent and only the children that support the permission', () => {
    const next = setMenuPermission(
      menus,
      createInitialPermissions(menus),
      'journal',
      'create',
      true
    );

    expect(flags(next, 'journal').create).toBe(true);
    expect(flags(next, 'journal-list').create).toBe(true);
    expect(flags(next, 'journal-report').create).toBe(false);
  });

  it('clears the parent and its supporting children', () => {
    let next = setMenuPermission(menus, createInitialPermissions(menus), 'journal', 'read', true);
    next = setMenuPermission(menus, next, 'journal', 'read', false);

    expect(flags(next, 'journal').read).toBe(false);
    expect(flags(next, 'journal-list').read).toBe(false);
    expect(flags(next, 'journal-report').read).toBe(false);
  });

  it('sets a menu without children on its own', () => {
    const next = setMenuPermission(
      menus,
      createInitialPermissions(menus),
      'dashboard',
      'read',
      true
    );

    expect(flags(next, 'dashboard').read).toBe(true);
  });
});

describe('buildRolePayload', () => {
  it('sends the role name and every permission entry', () => {
    const permissions = createInitialPermissions(menus);

    expect(buildRolePayload('Auditor', permissions)).toEqual({
      name: 'Auditor',
      menuAccessRolePermission: permissions,
    });
  });
});
