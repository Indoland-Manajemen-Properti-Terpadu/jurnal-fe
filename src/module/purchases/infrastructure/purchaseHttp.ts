import apiClient from '@/lib/http/apiClient';
import { toPurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';

export type QueryValue = string | number | boolean | null | undefined;

const READ_TIMEOUT_MS = 30_000;
const WRITE_TIMEOUT_MS = 60_000;
const UPLOAD_TIMEOUT_MS = 120_000;

/** The backend rejects empty and unknown query values with a 400, so only real values are sent. */
export const cleanParams = (
  params: Record<string, QueryValue>
): Record<string, string | number | boolean> =>
  Object.entries(params).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    if (typeof value === 'string' && value.trim() === '') return acc;
    acc[key] = value;
    return acc;
  }, {});

const request = async <T>(call: () => Promise<{ data: T }>): Promise<T> => {
  try {
    const { data } = await call();
    return data;
  } catch (error) {
    throw toPurchaseError(error);
  }
};

export const http = {
  get: <T>(url: string, params?: Record<string, QueryValue>) =>
    request(() =>
      apiClient.get<T>(url, {
        ...(params ? { params: cleanParams(params) } : {}),
        timeout: READ_TIMEOUT_MS,
      })
    ),
  post: <T>(url: string, body?: unknown) =>
    request(() => apiClient.post<T>(url, body ?? {}, { timeout: WRITE_TIMEOUT_MS })),
  put: <T>(url: string, body?: unknown) =>
    request(() => apiClient.put<T>(url, body ?? {}, { timeout: WRITE_TIMEOUT_MS })),
  upload: <T>(url: string, form: FormData) =>
    request(() => apiClient.post<T>(url, form, { timeout: UPLOAD_TIMEOUT_MS })),
  blob: (url: string, params?: Record<string, QueryValue>) =>
    request(() =>
      apiClient.get<Blob>(url, {
        ...(params ? { params: cleanParams(params) } : {}),
        responseType: 'blob',
        timeout: UPLOAD_TIMEOUT_MS,
      })
    ),
};
