import { isAxiosError } from 'axios';

export type PurchaseErrorKind =
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
 * One error type for every purchasing call. The backend answers business refusals in Indonesian
 * (safe to show), request validation as English field errors (never shown as written), and
 * includes a `stack` in non-production, which is never kept.
 */
export class PurchaseError extends Error {
  readonly kind: PurchaseErrorKind;
  readonly status?: number;
  /** Indonesian business message from the server; only set for `domain` and `forbidden`. */
  readonly serverMessage?: string;
  readonly fieldErrors: FieldError[];

  constructor(init: {
    kind: PurchaseErrorKind;
    status?: number;
    serverMessage?: string;
    fieldErrors?: FieldError[];
  }) {
    super(init.kind);
    this.name = 'PurchaseError';
    this.kind = init.kind;
    this.status = init.status;
    this.serverMessage = init.serverMessage;
    this.fieldErrors = init.fieldErrors ?? [];
  }
}

const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined);

const readFieldErrors = (data: unknown[]): FieldError[] =>
  data.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const { field, message } = item as Record<string, unknown>;
    return typeof field === 'string' && typeof message === 'string' ? [{ field, message }] : [];
  });

export const toPurchaseError = (error: unknown): PurchaseError => {
  if (error instanceof PurchaseError) return error;
  if (!isAxiosError(error)) return new PurchaseError({ kind: 'unknown' });

  const { response } = error;
  if (!response) return new PurchaseError({ kind: 'network' });

  const { status } = response;
  const body = (response.data ?? {}) as { message?: unknown; data?: unknown };
  const serverMessage = asText(body.message);

  if (status === 401) return new PurchaseError({ kind: 'unauthorized', status });
  if (status === 403) return new PurchaseError({ kind: 'forbidden', status, serverMessage });
  if (status === 404) return new PurchaseError({ kind: 'notFound', status });
  if ([408, 502, 503, 504].includes(status)) return new PurchaseError({ kind: 'network', status });
  if (status === 400 && Array.isArray(body.data)) {
    return new PurchaseError({
      kind: 'validation',
      status,
      fieldErrors: readFieldErrors(body.data),
    });
  }
  if (status >= 400 && status < 500 && serverMessage) {
    return new PurchaseError({ kind: 'domain', status, serverMessage });
  }
  return new PurchaseError({ kind: 'unknown', status });
};
