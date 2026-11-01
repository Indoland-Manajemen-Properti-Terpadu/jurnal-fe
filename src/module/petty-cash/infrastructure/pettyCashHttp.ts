import apiClient from '@/lib/http/apiClient';
import { toPettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import { cleanParams, type QueryValue } from '@/module/petty-cash/infrastructure/queryParams';

/**
 * Timeouts are set per request here rather than on the shared client, which also serves long
 * exports, imports and reports in other modules. A request that times out has no answer, so it is
 * handled like a dropped connection and its idempotency key is kept.
 */
export const READ_TIMEOUT_MS = 30_000;
export const WRITE_TIMEOUT_MS = 60_000;
export const UPLOAD_TIMEOUT_MS = 120_000;

const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/** Every call rethrows a normalized `PettyCashError`; callers never see the raw Axios error. */
const request = async <T>(call: () => Promise<{ data: T }>): Promise<T> => {
  try {
    const { data } = await call();
    return data;
  } catch (error) {
    throw toPettyCashError(error);
  }
};

export interface WriteOptions {
  idempotencyKey?: string;
  upload?: boolean;
}

const writeConfig = ({ idempotencyKey, upload }: WriteOptions = {}) => ({
  timeout: upload ? UPLOAD_TIMEOUT_MS : WRITE_TIMEOUT_MS,
  ...(idempotencyKey ? { headers: { [IDEMPOTENCY_HEADER]: idempotencyKey } } : {}),
});

export const http = {
  get: <T>(url: string, params?: Record<string, QueryValue>) =>
    request(() =>
      apiClient.get<T>(url, {
        ...(params ? { params: cleanParams(params) } : {}),
        timeout: READ_TIMEOUT_MS,
      })
    ),
  post: <T>(url: string, body?: unknown, options?: WriteOptions) =>
    request(() => apiClient.post<T>(url, body, writeConfig(options))),
  patch: <T>(url: string, body?: unknown, options?: WriteOptions) =>
    request(() => apiClient.patch<T>(url, body, writeConfig(options))),
  delete: <T>(url: string) =>
    request(() => apiClient.delete<T>(url, { timeout: WRITE_TIMEOUT_MS })),
};
