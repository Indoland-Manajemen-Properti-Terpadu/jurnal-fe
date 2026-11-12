import axios from 'axios';

export type BankConnectionErrorKind =
  | 'unavailable'
  | 'notFound'
  | 'validation'
  | 'refused'
  | 'conflict'
  | 'rateLimited'
  | 'forbidden'
  | 'network'
  | 'unknown';

/** One error type for every call: a kind to branch on, the stable code, and per-field messages. The server stack is never kept. */
export class BankConnectionError extends Error {
  readonly kind: BankConnectionErrorKind;

  readonly code?: string;

  readonly status?: number;

  readonly fieldErrors?: Record<string, string>;

  constructor(
    kind: BankConnectionErrorKind,
    message = '',
    extra: { code?: string; status?: number; fieldErrors?: Record<string, string> } = {}
  ) {
    super(message);
    this.name = 'BankConnectionError';
    this.kind = kind;
    this.code = extra.code;
    this.status = extra.status;
    this.fieldErrors = extra.fieldErrors;
  }
}

type ErrorBody = {
  message?: unknown;
  errorCode?: unknown;
  code?: unknown;
  data?: unknown;
};

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;

const fieldErrorsOf = (body: ErrorBody): Record<string, string> | undefined => {
  if (!Array.isArray(body.data)) return undefined;
  const entries = body.data
    .map((item) => item as { field?: unknown; message?: unknown })
    .filter((item) => text(item.field) && text(item.message))
    .map((item) => [item.field as string, item.message as string] as const);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

export const toBankConnectionError = (error: unknown): BankConnectionError => {
  if (error instanceof BankConnectionError) return error;
  if (!axios.isAxiosError(error)) {
    const network = error instanceof Error && error.message === 'Network Error';
    return new BankConnectionError(network ? 'network' : 'unknown');
  }
  const { response } = error;
  if (!response) return new BankConnectionError('network');

  const { status } = response;
  const body = (response.data ?? {}) as ErrorBody;
  const message = text(body.message) ?? '';
  const code = text(body.errorCode) ?? text(body.code);
  const fieldErrors = fieldErrorsOf(body);
  const extra = { code, status, fieldErrors };

  if (status === 404) return new BankConnectionError('notFound', message, extra);
  if (status === 403) return new BankConnectionError('forbidden', message, extra);
  if (status === 429) return new BankConnectionError('rateLimited', message, extra);
  if (status === 409) return new BankConnectionError('conflict', message, extra);
  if (status === 400 || status === 422) {
    return new BankConnectionError(fieldErrors ? 'validation' : 'refused', message, extra);
  }
  return new BankConnectionError('unknown', message, extra);
};
