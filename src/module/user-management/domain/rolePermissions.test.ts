import {
  applyRolePermissions,
  buildRolePayload,
  createInitialPermissions,
  permissionLetters,
  permissionsFromLetters,
  setColumnPermission,
  setPermission,
  supportsPermission,
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

describe('setPermission', () => {
  it('changes one menu and leaves its parent and siblings alone', () => {
    const start = createInitialPermissions(menus);

    const result = setPermission(start, 'journal-list', 'read', true);

    expect(flags(result, 'journal-list').read).toBe(true);
    expect(flags(result, 'journal').read).toBe(false);
    expect(flags(result, 'journal-report').read).toBe(false);
  });

  it('can switch a right off again', () => {
    const on = setPermission(createInitialPermissions(menus), 'dashboard', 'read', true);

    expect(flags(setPermission(on, 'dashboard', 'read', false), 'dashboard').read).toBe(false);
  });
});

describe('setColumnPermission', () => {
  it('sets only menus that support the permission', () => {
    const result = setColumnPermission(menus, createInitialPermissions(menus), 'delete', true);

    expect(flags(result, 'journal').delete).toBe(true);
    expect(flags(result, 'journal-list').delete).toBe(true);
    expect(flags(result, 'journal-report').delete).toBe(false);
    expect(flags(result, 'dashboard').delete).toBe(false);
  });

  it('skips menus the caller may not change', () => {
    const result = setColumnPermission(
      menus,
      createInitialPermissions(menus),
      'read',
      true,
      (menuId) => menuId !== 'dashboard'
    );

    expect(flags(result, 'journal').read).toBe(true);
    expect(flags(result, 'dashboard').read).toBe(false);
  });

  it('clears the column', () => {
    const all = setColumnPermission(menus, createInitialPermissions(menus), 'read', true);

    const cleared = setColumnPermission(menus, all, 'read', false);

    expect(cleared.every((entry) => !entry.read)).toBe(true);
  });
});

describe('buildRolePayload', () => {
  it('sends only menus with a right, keyed by menuId, and drops unsupported rights', () => {
    const permissions = createInitialPermissions(menus).map((entry) =>
      entry.menuId === 'journal-report'
        ? { ...entry, read: true, delete: true }
        : entry.menuId === 'dashboard'
          ? { ...entry, read: true }
          : entry
    );

    expect(buildRolePayload(menus, ' Auditor ', ' Melihat laporan ', permissions)).toEqual({
      name: 'Auditor',
      description: 'Melihat laporan',
      menuAccessRolePermission: [
        { menuId: 'journal-report', create: false, read: true, update: false, delete: false },
        { menuId: 'dashboard', create: false, read: true, update: false, delete: false },
      ],
    });
  });

  it('sends an empty list for a role without rights', () => {
    const payload = buildRolePayload(menus, 'Kosong', '', createInitialPermissions(menus));

    expect(payload.menuAccessRolePermission).toEqual([]);
  });

  it('leaves the description out when it is empty', () => {
    const payload = buildRolePayload(menus, 'Kosong', '   ', createInitialPermissions(menus));

    expect(payload).not.toHaveProperty('description');
  });
});

describe('applyRolePermissions', () => {
  it('switches on what the role grants and leaves the rest off', () => {
    const result = applyRolePermissions(menus, [
      { menuId: 'dashboard', create: false, read: true, update: false, delete: false },
    ]);

    expect(flags(result, 'dashboard').read).toBe(true);
    expect(flags(result, 'journal').read).toBe(false);
    expect(result).toHaveLength(4);
  });
});

describe('permission letters', () => {
  it('writes letters in c, r, u, d order', () => {
    expect(permissionLetters({ delete: true, create: true, read: true })).toBe('crd');
    expect(permissionLetters(undefined)).toBe('');
  });

  it('reads letters back and ignores unknown ones', () => {
    expect(permissionsFromLetters('cru')).toEqual(['create', 'read', 'update']);
    expect(permissionsFromLetters('x')).toEqual([]);
  });
});
