import { isAxiosError } from 'axios';

export type ApiErrorKind =
  | 'validation'
  | 'domain'
  | 'forbidden'
  | 'unauthorized'
  | 'notFound'
  | 'network'
  | 'unknown';

export interface FieldError {
  field: string;
  message: string;
}

/**
 * One error type for calls to the ProApps API. The backend answers business refusals in Indonesian
 * (safe to show), request validation as English field errors (never shown as written), and
 * includes a `stack` in non-production, which is never kept.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  /** Indonesian business message from the server; only set for `domain` and `forbidden`. */
  readonly serverMessage?: string;
  readonly fieldErrors: FieldError[];
  /** Extra data a business refusal carries (for example the figures that differ); never shown as written. */
  readonly details: unknown[];

  constructor(init: {
    kind: ApiErrorKind;
    status?: number;
    serverMessage?: string;
    fieldErrors?: FieldError[];
    details?: unknown[];
  }) {
    super(init.kind);
    this.name = 'ApiError';
    this.kind = init.kind;
    this.status = init.status;
    this.serverMessage = init.serverMessage;
    this.fieldErrors = init.fieldErrors ?? [];
    this.details = init.details ?? [];
  }
}

const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined);

const readFieldErrors = (data: unknown[]): FieldError[] =>
  data.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const { field, message } = item as Record<string, unknown>;
    return typeof field === 'string'
      ? [{ field, message: typeof message === 'string' ? message : '' }]
      : [];
  });

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error)) return new ApiError({ kind: 'unknown' });

  const { response } = error;
  if (!response) return new ApiError({ kind: 'network' });

  const { status } = response;
  const body = (response.data ?? {}) as { message?: unknown; data?: unknown };
  const serverMessage = asText(body.message);

  if (status === 401) return new ApiError({ kind: 'unauthorized', status });
  if (status === 403) return new ApiError({ kind: 'forbidden', status, serverMessage });
  if (status === 404) return new ApiError({ kind: 'notFound', status });
  if ([408, 502, 503, 504].includes(status)) return new ApiError({ kind: 'network', status });
  if (status === 400 && Array.isArray(body.data)) {
    const fieldErrors = readFieldErrors(body.data);
    // A list without fields is a business refusal that carries data (a bill's differences), not a bad entry.
    if (fieldErrors.length === 0 && serverMessage) {
      return new ApiError({ kind: 'domain', status, serverMessage, details: body.data });
    }
    return new ApiError({ kind: 'validation', status, fieldErrors });
  }
  if (status >= 400 && status < 500 && serverMessage) {
    return new ApiError({ kind: 'domain', status, serverMessage });
  }
  return new ApiError({ kind: 'unknown', status });
};

export interface ApiErrorMessages {
  rejected: string;
  forbidden: string;
  validation: string;
  unauthorized: string;
  notFound: string;
  network: string;
  generic: string;
}

/**
 * A safe sentence for any API failure. The server's business messages are Indonesian and specific
 * (they name amounts and documents), so Indonesian readers get them as written; English readers get
 * a generic sentence. Validation text, status codes and stack traces never show.
 */
export const describeApiError = (
  error: unknown,
  language: string,
  messages: ApiErrorMessages
): string => {
  const normalized = toApiError(error);
  switch (normalized.kind) {
    case 'domain':
      return language === 'id' && normalized.serverMessage
        ? normalized.serverMessage
        : messages.rejected;
    case 'forbidden':
      return language === 'id' &&
        normalized.serverMessage &&
        normalized.serverMessage !== 'Forbidden Access Role'
        ? normalized.serverMessage
        : messages.forbidden;
    case 'validation':
      return messages.validation;
    case 'unauthorized':
      return messages.unauthorized;
    case 'notFound':
      return messages.notFound;
    case 'network':
      return messages.network;
    default:
      return messages.generic;
  }
};
