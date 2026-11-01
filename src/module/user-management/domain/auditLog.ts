import { permissionsFromLetters, type PermissionType } from './rolePermissions';

export const AUDIT_ACTIONS = [
  'USER_CREATE',
  'USER_UPDATE',
  'USER_PASSWORD_CHANGE',
  'ROLE_CREATE',
  'ROLE_UPDATE',
  'ROLE_DELETE',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type AuditTargetType = 'User' | 'AccessRole';

/** A snapshot is whatever the backend stored; roles carry `permissions: { menuId: 'crud' }`. */
export type AuditSnapshot = Record<string, unknown>;

export interface AuditEntry {
  id: string;
  actorName: string;
  action: string;
  targetType: string;
  targetName: string;
  before?: AuditSnapshot;
  after?: AuditSnapshot;
  createdAt: string;
}

export interface AuditList {
  results: AuditEntry[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface AuditFilters {
  action?: AuditAction;
  targetType?: AuditTargetType;
}

export const isKnownAction = (action: string): action is AuditAction =>
  (AUDIT_ACTIONS as readonly string[]).includes(action);

/** A change to one field of a snapshot. */
export interface FieldChange {
  field: string;
  before: unknown;
  after: unknown;
}

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Fields that differ between two snapshots; a missing side counts as empty. `permissions` is split per menu elsewhere. */
export const changedFields = (before?: AuditSnapshot, after?: AuditSnapshot): FieldChange[] => {
  const fields = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  return [...fields]
    .filter((field) => field !== 'permissions')
    .filter((field) => !sameValue(before?.[field], after?.[field]))
    .map((field) => ({ field, before: before?.[field], after: after?.[field] }));
};

export interface PermissionChange {
  menuId: string;
  before: PermissionType[];
  after: PermissionType[];
}

const letterMap = (snapshot?: AuditSnapshot): Record<string, string> => {
  const value = snapshot?.permissions;
  return value && typeof value === 'object' ? (value as Record<string, string>) : {};
};

/** Menus whose rights changed between two role snapshots. */
export const changedPermissions = (
  before?: AuditSnapshot,
  after?: AuditSnapshot
): PermissionChange[] => {
  const was = letterMap(before);
  const now = letterMap(after);
  return [...new Set([...Object.keys(was), ...Object.keys(now)])]
    .filter((menuId) => (was[menuId] ?? '') !== (now[menuId] ?? ''))
    .map((menuId) => ({
      menuId,
      before: permissionsFromLetters(was[menuId] ?? ''),
      after: permissionsFromLetters(now[menuId] ?? ''),
    }));
};

/** Whether the entry has anything to show beyond its headline. */
export const hasDetail = (entry: Pick<AuditEntry, 'before' | 'after'>): boolean =>
  changedFields(entry.before, entry.after).length > 0 ||
  changedPermissions(entry.before, entry.after).length > 0 ||
  Object.keys(letterMap(entry.after)).length > 0;
