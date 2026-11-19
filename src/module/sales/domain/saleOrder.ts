import type { AmountCount, SaleDocHeader, SaleDocListParams } from './saleDocument';

export type OrderStatus =
  | 'DRAFT'
  | 'WAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export const ORDER_TABS = ['running', 'finished', 'cancelled'] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

export interface SaleOrder extends SaleDocHeader {
  /** Target Selesai: when the work should be done; null when none was given. */
  targetDate: string | null;
  deliveryAddress: string;
  status: OrderStatus;
  /** Id of the quote this order was made from. */
  quote: string | null;
  /** Id of the invoice made from this order. */
  sale: string | null;
  sentAt: string | null;
  confirmedAt: string | null;
}

export interface OrderSummary {
  /** Waiting for the customer's confirmation. */
  awaiting: AmountCount;
  /** Confirmed and ready to be invoiced. */
  ready: AmountCount;
  invoiced: AmountCount;
  counts: Record<OrderTab, number>;
}

export type OrderListParams = SaleDocListParams<OrderTab>;

export interface OrderActionSet {
  edit: boolean;
  send: boolean;
  confirm: boolean;
  cancel: boolean;
  remove: boolean;
  duplicate: boolean;
  createInvoice: boolean;
  viewInvoice: boolean;
}

/**
 * What an order offers in its current status, as the sales API guide lays it out. COMPLETED is
 * set by making an invoice, never by an order endpoint. Rights are applied separately.
 */
export const orderActions = (order: Pick<SaleOrder, 'status' | 'sale'>): OrderActionSet => {
  const { status } = order;
  return {
    edit: status === 'DRAFT' || status === 'WAITING_CONFIRMATION' || status === 'CONFIRMED',
    send: status === 'DRAFT',
    confirm: status === 'WAITING_CONFIRMATION',
    cancel: status === 'WAITING_CONFIRMATION' || status === 'CONFIRMED',
    remove: status === 'DRAFT',
    duplicate: true,
    createInvoice: status === 'CONFIRMED',
    viewInvoice: status === 'COMPLETED' && Boolean(order.sale),
  };
};

/** What the signed-in user may do: orders by `JP-SALES-ORDER`, invoices by `JP-SALES`. */
export interface OrderRights {
  create: boolean;
  update: boolean;
  delete: boolean;
  createInvoice: boolean;
  readInvoice: boolean;
}

export const allowedOrderActions = (
  actions: OrderActionSet,
  rights: OrderRights
): OrderActionSet => ({
  edit: actions.edit && rights.update,
  send: actions.send && rights.update,
  confirm: actions.confirm && rights.update,
  cancel: actions.cancel && rights.delete,
  remove: actions.remove && rights.delete,
  duplicate: actions.duplicate && rights.create,
  createInvoice: actions.createInvoice && rights.createInvoice,
  viewInvoice: actions.viewInvoice && rights.readInvoice,
});
