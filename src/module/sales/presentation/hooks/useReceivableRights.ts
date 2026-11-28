import { useMyGrants } from '@/module/user-management';
import { SALE_MENU } from '../../domain/saleMenu';

export const useReceivableRights = () => {
  const { can, isReady } = useMyGrants();
  const allow = (menu: string, action: 'create' | 'read' | 'update') =>
    !isReady || can(menu, action);
  return {
    isReady,
    canRead: allow(SALE_MENU.reports, 'read'),
    canRecordPayment: allow(SALE_MENU.invoices, 'create'),
    canViewInvoices: allow(SALE_MENU.invoices, 'read'),
    canSendInvoiceEmail: allow(SALE_MENU.invoices, 'update'),
    canViewOrders: allow(SALE_MENU.orders, 'read'),
  };
};
