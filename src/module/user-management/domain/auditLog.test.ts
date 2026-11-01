import { changedFields, changedPermissions, hasDetail, isKnownAction } from './auditLog';

describe('changedFields', () => {
  it('lists the fields that differ, ignoring permissions', () => {
    expect(
      changedFields(
        { name: 'A', isActive: true, accessRole: ['1'], permissions: { X: 'r' } },
        { name: 'B', isActive: true, accessRole: ['1', '2'], permissions: { X: 'rc' } }
      )
    ).toEqual([
      { field: 'name', before: 'A', after: 'B' },
      { field: 'accessRole', before: ['1'], after: ['1', '2'] },
    ]);
  });

  it('treats a missing before as empty (a creation)', () => {
    expect(changedFields(undefined, { name: 'A' })).toEqual([
      { field: 'name', before: undefined, after: 'A' },
    ]);
  });
});

describe('changedPermissions', () => {
  it('compares the letter maps per menu', () => {
    expect(
      changedPermissions(
        { permissions: { 'JP-SALES': 'c', 'JP-GL': 'r' } },
        { permissions: { 'JP-SALES': 'cr', 'JP-GL': 'r' } }
      )
    ).toEqual([{ menuId: 'JP-SALES', before: ['create'], after: ['create', 'read'] }]);
  });

  it('reports a removed menu as losing every right', () => {
    expect(changedPermissions({ permissions: { 'JP-GL': 'r' } }, { permissions: {} })).toEqual([
      { menuId: 'JP-GL', before: ['read'], after: [] },
    ]);
  });
});

describe('hasDetail and isKnownAction', () => {
  it('has no detail for an entry without snapshots', () => {
    expect(hasDetail({})).toBe(false);
  });

  it('recognises known actions only', () => {
    expect(isKnownAction('ROLE_DELETE')).toBe(true);
    expect(isKnownAction('SOMETHING_ELSE')).toBe(false);
  });
});
