import {
  canChangePassword,
  formatDate,
  getPasswordChecks,
  initialsOf,
  isProfileDirty,
  validatePersonalInfo,
  type Profile,
} from './profile';

const profile: Profile = {
  id: 'u1',
  name: 'Budi Santoso',
  email: 'budi@example.com',
  role: 'user',
  isActive: true,
  isEmailVerified: true,
  roles: [],
};

describe('validatePersonalInfo', () => {
  it('needs a name and a valid email', () => {
    expect(validatePersonalInfo(' ', 'a@b.id')).toBe('nameEmpty');
    expect(validatePersonalInfo('Budi', 'not-an-email')).toBe('emailInvalid');
    expect(validatePersonalInfo('Budi', ' budi@example.com ')).toBeNull();
  });
});

describe('isProfileDirty', () => {
  it('ignores surrounding spaces and reports a real change', () => {
    expect(isProfileDirty(profile, ' Budi Santoso ', 'budi@example.com')).toBe(false);
    expect(isProfileDirty(profile, 'Budi S', 'budi@example.com')).toBe(true);
    expect(isProfileDirty(profile, 'Budi Santoso', 'baru@example.com')).toBe(true);
  });
});

describe('password rules', () => {
  it('checks each requirement on its own', () => {
    expect(getPasswordChecks('lama1234', 'abc', 'abd')).toEqual({
      isMinLength: false,
      hasLetter: true,
      hasNumber: false,
      isMatch: false,
      isDifferent: true,
    });
  });

  it('allows a change only when everything holds', () => {
    expect(canChangePassword('lama1234', 'baru12345', 'baru12345')).toBe(true);
    expect(canChangePassword('', 'baru12345', 'baru12345')).toBe(false);
    expect(canChangePassword('lama1234', 'baru12345', 'baru1234')).toBe(false);
    expect(canChangePassword('lama1234', 'lama1234', 'lama1234')).toBe(false);
    expect(canChangePassword('lama1234', 'hurufsaja', 'hurufsaja')).toBe(false);
    expect(canChangePassword('lama1234', '12345678', '12345678')).toBe(false);
    expect(canChangePassword('lama1234', 'baru1', 'baru1')).toBe(false);
  });
});

describe('initialsOf', () => {
  it('takes two letters from the name', () => {
    expect(initialsOf('Sari Wulandari')).toBe('SW');
    expect(initialsOf('Finance')).toBe('FI');
    expect(initialsOf('  budi   santoso  putra ')).toBe('BS');
    expect(initialsOf('   ')).toBe('?');
  });
});

describe('formatDate', () => {
  it('follows the language and shows a dash when there is no date', () => {
    expect(formatDate(undefined, 'id')).toBe('-');
    expect(formatDate('2026-03-15T12:00:00.000Z', 'id')).toContain('Maret');
    expect(formatDate('2026-03-15T12:00:00.000Z', 'en')).toContain('March');
  });
});
