import { describe, expect, it } from 'vitest';
import type { AccessRole } from './accessRole';
import { accessLevelOf, filterUsers, pageOf, roleCounts } from './userDirectory';
import type { ManagedUser } from './userTypes';

const right = (menuId: string, ...types: Array<'create' | 'read' | 'update' | 'delete'>) => ({
  menuId,
  create: types.includes('create'),
  read: types.includes('read'),
  update: types.includes('update'),
  delete: types.includes('delete'),
});

const role = (
  id: string,
  name: string,
  permissions = [right('JP-GL', 'read')],
  isDefault = false
): AccessRole => ({
  id,
  name,
  description: '',
  isDefault,
  permissions,
});

const user = (
  id: string,
  name: string,
  accessRoleIds: string[],
  legacyRole = 'user'
): ManagedUser => ({
  id,
  name,
  email: `${name.toLowerCase().replace(/\s/g, '.')}@proapps.id`,
  isActive: true,
  accessRoleIds,
  legacyRole,
  createdAt: '2026-11-01T00:00:00.000Z',
});

describe('accessLevelOf', () => {
  const roles = [
    role('sa', 'Super Admin', [], true),
    role('viewer', 'Viewer', [right('JP-GL', 'read'), right('JP-SALES', 'read')]),
    role('clerk', 'Clerk', [right('JP-SALES', 'read', 'create')]),
    role('empty', 'Empty', []),
  ];

  it('gives the Super Admin role and a legacy superadmin full access', () => {
    expect(accessLevelOf(user('1', 'A', ['sa']), roles)).toBe('full');
    expect(accessLevelOf(user('2', 'B', [], 'superadmin'), roles)).toBe('full');
  });

  it('calls a person who can only look read-only', () => {
    expect(accessLevelOf(user('3', 'C', ['viewer']), roles)).toBe('readOnly');
  });

  it('calls a person who can change anything limited, even with one extra read role', () => {
    expect(accessLevelOf(user('4', 'D', ['clerk']), roles)).toBe('limited');
    expect(accessLevelOf(user('5', 'E', ['viewer', 'clerk']), roles)).toBe('limited');
  });

  it('gives no access to a person without a role or with a role that grants nothing', () => {
    expect(accessLevelOf(user('6', 'F', []), roles)).toBe('none');
    expect(accessLevelOf(user('7', 'G', ['empty']), roles)).toBe('none');
  });
});

describe('roleCounts', () => {
  it('lists only roles that have members, biggest first, ties by name', () => {
    const roles = [
      role('a', 'Banker'),
      role('b', 'Accountant'),
      role('c', 'Unused'),
      role('d', 'Clerk'),
    ];
    const users = [
      user('1', 'One', ['a', 'b']),
      user('2', 'Two', ['b']),
      user('3', 'Three', ['d']),
      user('4', 'Four', ['a']),
    ];

    expect(roleCounts(users, roles).map((entry) => [entry.name, entry.count])).toEqual([
      ['Accountant', 2],
      ['Banker', 2],
      ['Clerk', 1],
    ]);
  });
});

describe('filterUsers', () => {
  const users = [
    user('1', 'Mira Yilmaz', ['a']),
    user('2', 'Ethan Brooks', ['b']),
    user('3', 'Jin Park', ['a', 'b']),
  ];

  it('lists everyone with no filter', () => {
    expect(filterUsers(users, { roleId: null, query: '' })).toHaveLength(3);
  });

  it('keeps the members of one role, including people with several roles', () => {
    expect(filterUsers(users, { roleId: 'b', query: '' }).map((u) => u.id)).toEqual(['2', '3']);
  });

  it('matches name or e-mail, ignoring case and surrounding spaces', () => {
    expect(filterUsers(users, { roleId: null, query: '  PARK ' }).map((u) => u.id)).toEqual(['3']);
    expect(filterUsers(users, { roleId: null, query: 'ethan.brooks@' }).map((u) => u.id)).toEqual([
      '2',
    ]);
  });

  it('combines the role and the words', () => {
    expect(filterUsers(users, { roleId: 'a', query: 'brooks' })).toEqual([]);
  });
});

describe('pageOf', () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  it('slices a 1-based page', () => {
    expect(pageOf(items, 1, 10)).toHaveLength(10);
    expect(pageOf(items, 3, 10)).toEqual([21, 22, 23, 24, 25]);
  });

  it('clamps a page outside the list', () => {
    expect(pageOf(items, 9, 10)).toEqual([21, 22, 23, 24, 25]);
    expect(pageOf(items, 0, 10)[0]).toBe(1);
    expect(pageOf([], 1, 10)).toEqual([]);
  });
});
