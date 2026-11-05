import type { ListParams } from '@/module/purchases/infrastructure/purchaseApi';

export type DocumentKind = 'requests' | 'orders' | 'receipts' | 'bills' | 'payments' | 'returns';

/**
 * Every key starts with the signed-in user, so the cache of one user is never served to the next
 * user who signs in within the same session.
 */
export const purchaseKeys = {
  all: (scope: string) => ['purchases', scope] as const,
  access: (scope: string) => [...purchaseKeys.all(scope), 'access'] as const,
  lookups: (scope: string) => [...purchaseKeys.all(scope), 'lookups'] as const,
  suppliers: (scope: string, search: string) =>
    [...purchaseKeys.lookups(scope), 'suppliers', search] as const,
  products: (scope: string, search: string) =>
    [...purchaseKeys.lookups(scope), 'products', search] as const,
  documents: (scope: string, kind: DocumentKind) => [...purchaseKeys.all(scope), kind] as const,
  list: (scope: string, kind: DocumentKind, params: ListParams) =>
    [...purchaseKeys.documents(scope, kind), 'list', params] as const,
  detail: (scope: string, kind: DocumentKind, id: string) =>
    [...purchaseKeys.documents(scope, kind), 'detail', id] as const,
  credits: (scope: string, vendor: string) =>
    [...purchaseKeys.all(scope), 'credits', vendor] as const,
  aging: (scope: string, params: { asOf?: string; vendor?: string }) =>
    [...purchaseKeys.all(scope), 'aging', params] as const,
};
