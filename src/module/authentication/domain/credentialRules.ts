/** Validators return a key of the `authentication` namespace, or null when the value is valid. */
export type CredentialValidationKey = 'validation.emailInvalid' | 'validation.passwordMin';

export const MIN_PASSWORD_LENGTH = 6;

export const validateEmail = (value: string): CredentialValidationKey | null =>
  /^\S+@\S+\.\S+$/.test(value) ? null : 'validation.emailInvalid';

export const validatePassword = (value: string): CredentialValidationKey | null =>
  value.length < MIN_PASSWORD_LENGTH ? 'validation.passwordMin' : null;
