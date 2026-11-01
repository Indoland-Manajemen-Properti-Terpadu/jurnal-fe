import { isAxiosError } from 'axios';

/** Why a password change was refused, so the form can say it next to the right field. */
export type PasswordChangeError =
  | 'currentIncorrect'
  | 'sameAsCurrent'
  | 'invalid'
  | 'network'
  | 'unknown';

const messageOf = (data: unknown): string => {
  if (data && typeof data === 'object' && 'message' in data) {
    const { message } = data as { message?: unknown };
    return typeof message === 'string' ? message : '';
  }
  return '';
};

export const toPasswordChangeError = (error: unknown): PasswordChangeError => {
  if (!isAxiosError(error)) return 'unknown';
  if (!error.response) return 'network';
  if (error.response.status !== 400) return 'unknown';

  const message = messageOf(error.response.data).toLowerCase();
  if (message.includes('current password is incorrect')) return 'currentIncorrect';
  if (message.includes('different from the current')) return 'sameAsCurrent';
  return 'invalid';
};

export class PasswordChangeFailure extends Error {
  readonly kind: PasswordChangeError;

  constructor(kind: PasswordChangeError) {
    super(kind);
    this.kind = kind;
  }
}
