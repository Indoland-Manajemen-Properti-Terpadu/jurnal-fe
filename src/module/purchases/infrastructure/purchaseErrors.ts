import { ApiError, toApiError, type ApiErrorKind, type FieldError } from '@/lib/http/apiError';

/** Purchasing uses the shared API error; these names keep the module's own vocabulary. */
export type PurchaseErrorKind = ApiErrorKind;
export type { FieldError };
export { ApiError as PurchaseError, toApiError as toPurchaseError };
