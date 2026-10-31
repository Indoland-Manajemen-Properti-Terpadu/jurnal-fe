import { isAxiosError } from 'axios';

export type PettyCashErrorKind =
  | 'validation'
  | 'domain'
  | 'forbidden'
  | 'unauthorized'
  | 'network'
  | 'unknown';

export interface FieldError {
  field: string;
  message: string;
}

/**
 * One error type for every failure of `/v1/petty-cash`. The backend answers in several shapes:
 * Joi field errors (`data` is an array, English), domain errors (`data.errorCode`, Indonesian
 * message), business errors with only a message, `403 Forbidden Access Role` for a missing menu
 * right, and 401 without data. The server `stack` field is never kept.
 */
export class PettyCashError extends Error {
  readonly kind: PettyCashErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly serverMessage?: string;
  readonly fieldErrors: FieldError[];
  readonly details?: unknown;

  constructor(init: {
    kind: PettyCashErrorKind;
    status?: number;
    code?: string;
    serverMessage?: string;
    fieldErrors?: FieldError[];
    details?: unknown;
  }) {
    super(init.code ?? init.kind);
    this.name = 'PettyCashError';
    this.kind = init.kind;
    this.status = init.status;
    this.code = init.code;
    this.serverMessage = init.serverMessage;
    this.fieldErrors = init.fieldErrors ?? [];
    this.details = init.details;
  }
}

interface ErrorBody {
  message?: unknown;
  data?: unknown;
}

const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined);

const readFieldErrors = (data: unknown[]): FieldError[] =>
  data.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const { field, message } = item as Record<string, unknown>;
    return typeof field === 'string' && typeof message === 'string' ? [{ field, message }] : [];
  });

export const toPettyCashError = (error: unknown): PettyCashError => {
  if (error instanceof PettyCashError) return error;
  if (!isAxiosError(error)) return new PettyCashError({ kind: 'unknown' });

  const { response } = error;
  if (!response) return new PettyCashError({ kind: 'network' });

  const { status } = response;
  const body = (response.data ?? {}) as ErrorBody;
  const serverMessage = asText(body.message);
  const { data } = body;

  if (Array.isArray(data)) {
    return new PettyCashError({
      kind: 'validation',
      status,
      serverMessage,
      fieldErrors: readFieldErrors(data),
    });
  }

  const errorData =
    typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : undefined;
  const code = asText(errorData?.errorCode);
  if (code) {
    return new PettyCashError({
      kind: 'domain',
      status,
      code,
      serverMessage,
      details: errorData?.details,
    });
  }

  if (status === 401) return new PettyCashError({ kind: 'unauthorized', status });
  if (status === 403) return new PettyCashError({ kind: 'forbidden', status, serverMessage });
  if (status >= 400 && status < 500 && serverMessage) {
    return new PettyCashError({ kind: 'domain', status, serverMessage });
  }
  return new PettyCashError({ kind: 'unknown', status });
};
