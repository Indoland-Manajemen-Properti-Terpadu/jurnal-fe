import {
  formatJoinedDate,
  formatUpdatedDate,
  getPasswordChecks,
  isAdminRole,
  isProfileDirty,
  validateNewPassword,
  validatePersonalInfo,
  type Profile,
} from './profile';

const profile: Profile = {
  id: 'u1',
  name: 'Budi',
  email: 'budi@example.com',
  role: 'admin',
  isEmailVerified: true,
};

describe('validatePersonalInfo', () => {
  it('accepts a name and an email', () => {
    expect(validatePersonalInfo('Budi', 'budi@example.com')).toBeNull();
  });

  it('rejects blank or whitespace-only values', () => {
    expect(validatePersonalInfo('', 'a@b.c')).toBe('empty');
    expect(validatePersonalInfo('Budi', '   ')).toBe('empty');
  });
});

describe('validateNewPassword', () => {
  it('rejects fewer than 8 characters before checking the confirmation', () => {
    expect(validateNewPassword('abc1234', 'different')).toBe('tooShort');
  });

  it('rejects a confirmation that differs', () => {
    expect(validateNewPassword('abc12345', 'abc12346')).toBe('mismatch');
  });

  it('accepts exactly 8 matching characters, letters not required', () => {
    expect(validateNewPassword('12345678', '12345678')).toBeNull();
  });
});

describe('getPasswordChecks', () => {
  it('reports each requirement', () => {
    expect(getPasswordChecks('abc12345', 'abc12345')).toEqual({
      isMinLength: true,
      hasLetter: true,
      hasNumber: true,
      isMatch: true,
    });
    expect(getPasswordChecks('abcdefg', '')).toEqual({
      isMinLength: false,
      hasLetter: true,
      hasNumber: false,
      isMatch: false,
    });
  });

  it('does not treat two empty values as a match', () => {
    expect(getPasswordChecks('', '').isMatch).toBe(false);
  });
});

describe('isProfileDirty', () => {
  it('is false for the stored values and true after an edit', () => {
    expect(isProfileDirty(profile, 'Budi', 'budi@example.com')).toBe(false);
    expect(isProfileDirty(profile, 'Budi ', 'budi@example.com')).toBe(true);
  });
});

describe('isAdminRole', () => {
  it('is true only for admin and superadmin', () => {
    expect(isAdminRole('admin')).toBe(true);
    expect(isAdminRole('superadmin')).toBe(true);
    expect(isAdminRole('staff')).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});

describe('date formatting', () => {
  it('formats the joined date in Indonesian long form', () => {
    expect(formatJoinedDate('2026-03-15T12:00:00.000Z')).toBe('15 Maret 2026');
  });

  it('includes the date for the updated stamp', () => {
    expect(formatUpdatedDate('2026-03-15T12:00:00.000Z')).toContain('15 Maret 2026');
  });

  it('returns a dash when the date is missing', () => {
    expect(formatJoinedDate(undefined)).toBe('-');
    expect(formatUpdatedDate(undefined)).toBe('-');
  });
});
