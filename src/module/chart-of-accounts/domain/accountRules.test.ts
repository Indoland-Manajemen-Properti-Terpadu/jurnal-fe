import {
  canArchiveAccount,
  canChangeCategory,
  canDeleteAccount,
  getCategoryPrefix,
  hasValidName,
  isAccountSelectable,
  isCashBankCategory,
  isHierarchyAndAccessValid,
  resolveEffectiveDebit,
  validateAccountCategory,
  validateAccountCode,
  validateCreateName,
  validateEditName,
} from './accountRules';

describe('I5 contra flip when creating an account (characterization)', () => {
  it('uses the category flag and defaults to debit when unset', () => {
    expect(resolveEffectiveDebit(true, false)).toBe(true);
    expect(resolveEffectiveDebit(false, false)).toBe(false);
    expect(resolveEffectiveDebit(undefined, false)).toBe(true);
  });

  it('flips the side for a contra account', () => {
    expect(resolveEffectiveDebit(true, true)).toBe(false);
    expect(resolveEffectiveDebit(false, true)).toBe(true);
    expect(resolveEffectiveDebit(undefined, true)).toBe(false);
  });

  it('has no keyword fallback: a credit named category without a flag stays debit', () => {
    expect(resolveEffectiveDebit(undefined, false)).toBe(true);
  });
});

describe('I6 category prefix map in AddAccountJournal (characterization)', () => {
  const prefix = (categoryID: string, name = '') => getCategoryPrefix({ categoryID, name });

  it('returns an empty prefix without a category', () => {
    expect(getCategoryPrefix(undefined)).toBe('');
  });

  it.each([
    ['BLN', '', '8'],
    ['PLN', '', '7'],
    ['BEB', '', '6'],
    ['HPP', '', '5'],
    ['PEN', '', '4'],
    ['EKU', '', '3'],
    ['AH', '', '2'],
    ['KLL', '', '2'],
    ['KJP', '', '2'],
    ['KB', 'Kas & Bank', '1'],
  ])('maps code %s to %s', (code, name, expected) => {
    expect(prefix(code, name)).toBe(expected);
  });

  it.each([
    ['Beban Lain-lain', '8'],
    ['Pendapatan Lain', '7'],
    ['Beban Gaji', '6'],
    ['Biaya Umum', '6'],
    ['Harga Pokok Penjualan', '5'],
    ['Pokok Penjualan', '5'],
    ['Pendapatan Usaha', '4'],
    ['Ekuitas', '3'],
    ['Modal Disetor', '3'],
    ['Hutang Usaha', '2'],
    ['Kewajiban Lancar', '2'],
    ['Liabilitas', '2'],
    ['Aset Tetap', '1'],
  ])('maps the name %s to %s when the code is unknown', (name, expected) => {
    expect(prefix('XXX', name)).toBe(expected);
  });

  it('matches the code case-insensitively and prefers the more specific name', () => {
    expect(prefix('beb')).toBe('6');
    expect(prefix('XXX', 'Beban Lain')).toBe('8');
  });
});

describe('I6 validation rules', () => {
  it('create needs a name of at least 3 characters after trimming', () => {
    expect(validateCreateName('ab')).toBe('validation.nameMin');
    expect(validateCreateName('  ab  ')).toBe('validation.nameMin');
    expect(validateCreateName('abc')).toBeNull();
    expect(hasValidName('abc', 3)).toBe(true);
    expect(hasValidName(' ab ', 3)).toBe(false);
  });

  it('edit only needs a non-empty name', () => {
    expect(validateEditName('   ')).toBe('validation.nameRequired');
    expect(validateEditName('K')).toBeNull();
  });

  it('requires code and category', () => {
    expect(validateAccountCode(' ')).toBe('validation.codeRequired');
    expect(validateAccountCode('1-10001')).toBeNull();
    expect(validateAccountCategory('')).toBe('validation.categoryRequired');
    expect(validateAccountCategory('c1')).toBeNull();
  });

  it('a Sub account requires a head account', () => {
    const base = {
      accountType: 'SubAccount',
      headAccountId: null,
      accessScope: 'AllUsers',
      specialUsersCount: 0,
      certainRolesCount: 0,
    };
    expect(isHierarchyAndAccessValid(base)).toBe(false);
    expect(isHierarchyAndAccessValid({ ...base, headAccountId: 'h1' })).toBe(true);
  });

  it('a single account with a restricted scope needs members; header and sub ignore the scope', () => {
    const single = {
      accountType: 'SingleAccount',
      headAccountId: null,
      accessScope: 'SpecialUsers',
      specialUsersCount: 0,
      certainRolesCount: 2,
    };
    expect(isHierarchyAndAccessValid(single)).toBe(false);
    expect(isHierarchyAndAccessValid({ ...single, specialUsersCount: 1 })).toBe(true);
    expect(isHierarchyAndAccessValid({ ...single, accessScope: 'CertainRoles' })).toBe(true);
    expect(
      isHierarchyAndAccessValid({ ...single, accessScope: 'CertainRoles', certainRolesCount: 0 })
    ).toBe(false);
    expect(isHierarchyAndAccessValid({ ...single, accountType: 'HeaderAccount' })).toBe(true);
  });
});

describe('I6 cash/bank auto flag', () => {
  it('is on for code KB or a name containing kas or bank', () => {
    expect(isCashBankCategory({ categoryID: 'KB', name: 'Apa saja' })).toBe(true);
    expect(isCashBankCategory({ categoryID: 'X', name: 'Kas Kecil' })).toBe(true);
    expect(isCashBankCategory({ categoryID: 'X', name: 'Rekening BANK' })).toBe(true);
  });

  it('is off otherwise and without a category', () => {
    expect(isCashBankCategory({ categoryID: 'kb', name: 'Pendapatan' })).toBe(false);
    expect(isCashBankCategory({ categoryID: 'PEN', name: 'Pendapatan' })).toBe(false);
    expect(isCashBankCategory(undefined)).toBe(false);
  });
});

describe('I7 locked account predicates', () => {
  it('a locked account cannot be selected, deleted, archived or change category', () => {
    expect(isAccountSelectable({ isLocked: true })).toBe(false);
    expect(canDeleteAccount({ isLocked: true })).toBe(false);
    expect(canArchiveAccount({ isLocked: true })).toBe(false);
    expect(canChangeCategory(true)).toBe(false);
  });

  it('an open account can', () => {
    expect(isAccountSelectable({ isLocked: false })).toBe(true);
    expect(isAccountSelectable({})).toBe(true);
    expect(canDeleteAccount({})).toBe(true);
    expect(canArchiveAccount({ isLocked: false })).toBe(true);
    expect(canChangeCategory(false)).toBe(true);
  });
});
