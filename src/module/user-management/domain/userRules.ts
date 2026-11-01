import type { AccessRole } from './accessRole';
import { isSuperAdminRole } from './grantRules';
import type { ManagedUser } from './userTypes';

export const MIN_PASSWORD_LENGTH = 8;

export interface PasswordChecks {
  longEnough: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
}

export const passwordChecks = (password: string): PasswordChecks => ({
  longEnough: password.length >= MIN_PASSWORD_LENGTH,
  hasLetter: /[A-Za-z]/.test(password),
  hasNumber: /\d/.test(password),
});

export const isPasswordValid = (password: string): boolean => {
  const checks = passwordChecks(password);
  return checks.longEnough && checks.hasLetter && checks.hasNumber;
};

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?';

/** Fixed-length password that always satisfies the policy; `random` is injectable for tests. */
export const generatePassword = (random: (max: number) => number, length = 12): string => {
  const pick = (source: string) => source[random(source.length)];
  const required = [pick(LETTERS), pick(LETTERS), pick(DIGITS), pick(DIGITS), pick(SYMBOLS)];
  const rest = Array.from({ length: Math.max(length - required.length, 0) }, () =>
    pick(LETTERS + DIGITS)
  );
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};

/** Why a user cannot be switched off, or `null` when they can. */
export type DeactivateBlock = 'self' | 'lastSuperAdmin';

export const deactivateBlockReason = (params: {
  user: ManagedUser;
  currentUserId: string | undefined;
  roles: AccessRole[];
  /** Every active user of the site; the last Super Admin cannot be switched off. */
  siteUsers: ManagedUser[];
}): DeactivateBlock | null => {
  const { user, currentUserId, roles, siteUsers } = params;
  if (user.id === currentUserId) return 'self';

  const superAdminIds = new Set(roles.filter(isSuperAdminRole).map((role) => role.id));
  const isSuperAdmin = (item: ManagedUser) =>
    item.accessRoleIds.some((id) => superAdminIds.has(id));
  if (!isSuperAdmin(user)) return null;

  const otherActive = siteUsers.filter((item) => item.id !== user.id && item.isActive);
  return otherActive.some(isSuperAdmin) ? null : 'lastSuperAdmin';
};

/** Whether giving `roleIds` to the user would take the Super Admin role away from the last holder. */
export const removesLastSuperAdmin = (params: {
  user: ManagedUser;
  nextRoleIds: string[];
  roles: AccessRole[];
  siteUsers: ManagedUser[];
}): boolean => {
  const { user, nextRoleIds, roles, siteUsers } = params;
  const superAdminIds = new Set(roles.filter(isSuperAdminRole).map((role) => role.id));
  const had = user.accessRoleIds.some((id) => superAdminIds.has(id));
  const keeps = nextRoleIds.some((id) => superAdminIds.has(id));
  if (!had || keeps) return false;
  const others = siteUsers.filter(
    (item) =>
      item.id !== user.id && item.isActive && item.accessRoleIds.some((id) => superAdminIds.has(id))
  );
  return others.length === 0;
};
