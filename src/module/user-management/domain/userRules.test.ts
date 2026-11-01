import type { AccessRole } from './accessRole';
import {
  deactivateBlockReason,
  generatePassword,
  isPasswordValid,
  passwordChecks,
  removesLastSuperAdmin,
} from './userRules';
import type { ManagedUser } from './userTypes';

const user = (id: string, roleIds: string[], isActive = true): ManagedUser => ({
  id,
  name: id,
  email: `${id}@x.id`,
  isActive,
  accessRoleIds: roleIds,
  legacyRole: 'user',
  createdAt: '',
});

const roles: AccessRole[] = [
  { id: 'sa', name: 'Super Admin', description: '', isDefault: true, permissions: [] },
  { id: 'k', name: 'Kasir', description: '', isDefault: false, permissions: [] },
];

describe('password policy', () => {
  it('needs 8 characters with a letter and a number', () => {
    expect(passwordChecks('abc12')).toEqual({
      longEnough: false,
      hasLetter: true,
      hasNumber: true,
    });
    expect(isPasswordValid('abcdefg1')).toBe(true);
    expect(isPasswordValid('abcdefgh')).toBe(false);
    expect(isPasswordValid('12345678')).toBe(false);
  });

  it('generates a password that meets the policy', () => {
    let seed = 7;
    const random = (max: number) => {
      seed = (seed * 31 + 11) % 9973;
      return seed % max;
    };

    const password = generatePassword(random);

    expect(password).toHaveLength(12);
    expect(isPasswordValid(password)).toBe(true);
  });
});

describe('deactivateBlockReason', () => {
  const base = { roles, currentUserId: 'me' };

  it('blocks switching yourself off', () => {
    const me = user('me', ['k']);
    expect(deactivateBlockReason({ ...base, user: me, siteUsers: [me] })).toBe('self');
  });

  it('blocks the last Super Admin', () => {
    const only = user('a', ['sa']);
    expect(
      deactivateBlockReason({ ...base, user: only, siteUsers: [only, user('b', ['k'])] })
    ).toBe('lastSuperAdmin');
  });

  it('allows it when another active Super Admin remains', () => {
    const a = user('a', ['sa']);
    expect(
      deactivateBlockReason({ ...base, user: a, siteUsers: [a, user('b', ['sa'])] })
    ).toBeNull();
  });

  it('ignores an inactive Super Admin when counting who remains', () => {
    const a = user('a', ['sa']);
    expect(
      deactivateBlockReason({ ...base, user: a, siteUsers: [a, user('b', ['sa'], false)] })
    ).toBe('lastSuperAdmin');
  });
});

describe('removesLastSuperAdmin', () => {
  it('is true when the only Super Admin loses the role', () => {
    const a = user('a', ['sa']);
    expect(removesLastSuperAdmin({ user: a, nextRoleIds: ['k'], roles, siteUsers: [a] })).toBe(
      true
    );
  });

  it('is false when the role is kept or someone else holds it', () => {
    const a = user('a', ['sa']);
    expect(
      removesLastSuperAdmin({ user: a, nextRoleIds: ['sa', 'k'], roles, siteUsers: [a] })
    ).toBe(false);
    expect(
      removesLastSuperAdmin({
        user: a,
        nextRoleIds: ['k'],
        roles,
        siteUsers: [a, user('b', ['sa'])],
      })
    ).toBe(false);
  });
});
