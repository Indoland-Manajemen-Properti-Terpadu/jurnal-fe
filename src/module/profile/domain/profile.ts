export interface ProfileSite {
  id: string;
  name: string;
  /** Code of the site in the property system it was created from. */
  code?: string;
}

export interface ProfileRole {
  id: string;
  name: string;
  description: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  /** Older single role (`user`, `admin`, `superadmin`); a `superadmin` holds every right. */
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  site?: ProfileSite;
  roles: ProfileRole[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileInput {
  id: string;
  name: string;
  email: string;
}

export const MIN_PASSWORD_LENGTH = 8;

export type PersonalInfoError = 'nameEmpty' | 'emailInvalid';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validatePersonalInfo = (name: string, email: string): PersonalInfoError | null => {
  if (!name.trim()) return 'nameEmpty';
  if (!EMAIL_PATTERN.test(email.trim())) return 'emailInvalid';
  return null;
};

export const isProfileDirty = (profile: Profile, name: string, email: string): boolean =>
  name.trim() !== profile.name || email.trim() !== profile.email;

export interface PasswordChecks {
  isMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  isMatch: boolean;
  isDifferent: boolean;
}

export const getPasswordChecks = (
  current: string,
  password: string,
  confirmation: string
): PasswordChecks => ({
  isMinLength: password.length >= MIN_PASSWORD_LENGTH,
  hasLetter: /[A-Za-z]/.test(password),
  hasNumber: /\d/.test(password),
  isMatch: password.length > 0 && password === confirmation,
  isDifferent: password.length > 0 && password !== current,
});

/** Everything the API requires of a new password, plus the confirmation and the current password. */
export const canChangePassword = (
  current: string,
  password: string,
  confirmation: string
): boolean => {
  const checks = getPasswordChecks(current, password, confirmation);
  return (
    current !== '' &&
    checks.isMinLength &&
    checks.hasLetter &&
    checks.hasNumber &&
    checks.isMatch &&
    checks.isDifferent
  );
};

/** Two letters for the avatar: first letters of the first two words, or the first two of one word. */
export const initialsOf = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return letters.toUpperCase();
};

const LOCALES = { id: 'id-ID', en: 'en-US' } as const;

export const formatDate = (
  value: string | undefined,
  language: string,
  withTime = false
): string => {
  if (!value) return '-';
  const locale = language === 'id' ? LOCALES.id : LOCALES.en;
  return new Date(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  });
};
