import { isAxiosError } from 'axios';

export type SaleErrorKind =
  | 'validation'
  | 'domain'
  | 'forbidden'
  | 'unauthorized'
  | 'notFound'
  | 'network'
  | 'unknown';

export interface ClassifiedSaleError {
  kind: SaleErrorKind;
  /** Business message from the server; only set for `domain` and `forbidden`. */
  serverMessage?: string;
}

const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined);

/**
 * Sorts a failed sales call into a kind the screens can word safely. Business refusals come with a
 * readable message; request validation arrives as field errors and is never shown as written.
 */
export const classifySaleError = (error: unknown): ClassifiedSaleError => {
  if (!isAxiosError(error)) return { kind: 'unknown' };
  const { response } = error;
  if (!response) return { kind: 'network' };

  const body = (response.data ?? {}) as { message?: unknown; data?: unknown };
  const { status } = response;
  if (status === 401) return { kind: 'unauthorized' };
  if (status === 403) return { kind: 'forbidden', serverMessage: asText(body.message) };
  if (status === 404) return { kind: 'notFound' };
  if (status === 503 && asText(body.message)?.startsWith('Server email (SMTP)')) {
    return { kind: 'domain', serverMessage: asText(body.message) };
  }
  // 429 is the order email's 30 second wait; its message says how long is left.
  if (status === 400 || status === 409 || status === 422 || status === 429) {
    if (Array.isArray(body.data) && body.data.length > 0) return { kind: 'validation' };
    const serverMessage = asText(body.message);
    return serverMessage ? { kind: 'domain', serverMessage } : { kind: 'unknown' };
  }
  return { kind: 'unknown' };
};

/** An unknown id is a 404 answer, not a transient failure; retrying it only keeps the skeleton up. */
export const retryUnlessNotFound = (failures: number, error: unknown): boolean =>
  classifySaleError(error).kind !== 'notFound' && failures < 2;
