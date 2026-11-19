import { useMyGrants } from '@/module/user-management';
import type { QuoteRights } from '../../domain/saleQuote';
import { SALE_MENU } from '../../domain/saleMenu';

/**
 * The user's rights on quotes. Until they are known nothing is hidden, so a slow answer never
 * flashes an empty menu; the server refuses what is not allowed anyway.
 */
export const useQuoteRights = (): QuoteRights & { canRead: boolean; isReady: boolean } => {
  const { can, isReady } = useMyGrants();
  const allow = (type: 'create' | 'read' | 'update' | 'delete') =>
    !isReady || can(SALE_MENU.quotes, type);
  return {
    create: allow('create'),
    update: allow('update'),
    delete: allow('delete'),
    canRead: allow('read'),
    isReady,
  };
};
