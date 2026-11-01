export interface ProfileSite {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  site?: ProfileSite;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UpdateProfileInput {
  id: string;
  name?: string;
  email?: string;
  password?: string;
}

export const MIN_PASSWORD_LENGTH = 8;

export type PersonalInfoError = 'empty';
export type PasswordError = 'tooShort' | 'mismatch';

export interface PasswordChecks {
  isMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  isMatch: boolean;
}

export const validatePersonalInfo = (name: string, email: string): PersonalInfoError | null =>
  !name.trim() || !email.trim() ? 'empty' : null;

export const validateNewPassword = (
  password: string,
  confirmation: string
): PasswordError | null => {
  if (password.length < MIN_PASSWORD_LENGTH) return 'tooShort';
  if (password !== confirmation) return 'mismatch';
  return null;
};

export const getPasswordChecks = (password: string, confirmation: string): PasswordChecks => ({
  isMinLength: password.length >= MIN_PASSWORD_LENGTH,
  hasLetter: /[a-zA-Z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  isMatch: password.length > 0 && password === confirmation,
});

export const isProfileDirty = (profile: Profile, name: string, email: string): boolean =>
  name !== (profile.name || '') || email !== (profile.email || '');

export const isAdminRole = (role?: string): boolean => role === 'superadmin' || role === 'admin';

const DATE_LOCALE = 'id-ID';

export const formatJoinedDate = (value?: string | Date): string =>
  value
    ? new Date(value).toLocaleDateString(DATE_LOCALE, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

export const formatUpdatedDate = (value?: string | Date): string =>
  value
    ? new Date(value).toLocaleDateString(DATE_LOCALE, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';
