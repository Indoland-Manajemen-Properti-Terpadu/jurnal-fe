import { useMyGrants } from '@/module/user-management';
import type { ReturnRights } from '../../domain/saleReturn';
import { SALE_MENU } from '../../domain/saleMenu';

/** The user's rights on returns. Until they are known nothing is hidden; the server refuses the rest. */
export const useReturnRights = (): ReturnRights & { canRead: boolean; isReady: boolean } => {
  const { can, isReady } = useMyGrants();
  const allow = (type: 'create' | 'read' | 'update' | 'delete') =>
    !isReady || can(SALE_MENU.returns, type);
  return {
    create: allow('create'),
    update: allow('update'),
    delete: allow('delete'),
    canRead: allow('read'),
    isReady,
  };
};
