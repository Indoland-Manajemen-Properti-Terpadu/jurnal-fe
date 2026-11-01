import { isAxiosError } from 'axios';

/** What went wrong, in terms the screens can turn into a sentence. */
export type UserManagementErrorKind =
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'invalid'
  | 'duplicateEmail'
  | 'network'
  | 'unknown';

export interface UserManagementError {
  kind: UserManagementErrorKind;
  /** Message from the API, kept for the screens that can show it safely (400 rule messages). */
  detail?: string;
}

const messageOf = (data: unknown): string | undefined => {
  if (data && typeof data === 'object' && 'message' in data) {
    const { message } = data as { message?: unknown };
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
};

export const toUserManagementError = (error: unknown): UserManagementError => {
  if (!isAxiosError(error)) return { kind: 'unknown' };
  if (!error.response) return { kind: 'network' };

  const { status, data } = error.response;
  const detail = messageOf(data);
  if (status === 403) return { kind: 'forbidden', detail };
  if (status === 404) return { kind: 'notFound', detail };
  if (status === 409) return { kind: 'conflict', detail };
  if (status === 400 && detail && /email.*(taken|already|exist)/i.test(detail)) {
    return { kind: 'duplicateEmail', detail };
  }
  if (status === 400 || status === 422) return { kind: 'invalid', detail };
  return { kind: 'unknown', detail };
};

const DEFINITIVE_STATUSES = [400, 401, 403, 404];

/** An answer that a retry will not change: a refusal, a missing record or a rejected input. */
export const isDefinitiveRefusal = (error: unknown): boolean =>
  isAxiosError(error) &&
  error.response !== undefined &&
  DEFINITIVE_STATUSES.includes(error.response.status);

export const isForbidden = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 403;
