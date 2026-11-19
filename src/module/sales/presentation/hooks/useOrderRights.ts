import { useMyGrants } from '@/module/user-management';
import type { OrderRights } from '../../domain/saleOrder';
import { SALE_MENU } from '../../domain/saleMenu';

/**
 * The user's rights on orders, and on invoices for making or opening one from an order. Until
 * they are known nothing is hidden; the server refuses what is not allowed anyway.
 */
export const useOrderRights = (): OrderRights & { canRead: boolean; isReady: boolean } => {
  const { can, isReady } = useMyGrants();
  const order = (type: 'create' | 'read' | 'update' | 'delete') =>
    !isReady || can(SALE_MENU.orders, type);
  const invoice = (type: 'create' | 'read') => !isReady || can(SALE_MENU.invoices, type);
  return {
    create: order('create'),
    update: order('update'),
    delete: order('delete'),
    createInvoice: invoice('create'),
    readInvoice: invoice('read'),
    canRead: order('read'),
    isReady,
  };
};
