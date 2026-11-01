import { isDefinitiveRefusal } from '@/module/user-management/infrastructure/apiError';

/** A refusal or a missing record will not change on a retry, so show it at once; retry only a flaky connection. */
export const retryTransient = (failureCount: number, error: unknown): boolean =>
  !isDefinitiveRefusal(error) && failureCount < 2;
