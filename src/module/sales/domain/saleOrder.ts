import type { AmountCount, SaleDocHeader, SaleDocListParams } from './saleDocument';

export type OrderStatus =
  | 'DRAFT'
  | 'WAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PARTIALLY_INVOICED'
  | 'COMPLETED'
  | 'CANCELLED';

export const ORDER_TABS = ['running', 'finished', 'cancelled'] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

/** One invoice made from the order. */
export interface OrderInvoice {
  id: string;
  number: string;
  date: string | null;
  status: string;
  amount: number;
}

export interface SaleOrder extends SaleDocHeader {
  /** Target Selesai: when the work should be done; null when none was given. */
  targetDate: string | null;
  deliveryAddress: string;
  status: OrderStatus;
  /** Id of the quote this order was made from, and its number. */
  quote: string | null;
  quoteNumber: string | null;
  /** Id of the invoice made from this order, and its number. */
  sale: string | null;
  saleNumber: string | null;
  /** Addresses the order was emailed to; empty until it was. */
  emails: string[];
  sentAt: string | null;
  confirmedAt: string | null;
  /** Every invoice made from the order; empty on a server that does not list them. */
  invoices: OrderInvoice[];
  /** What invoices bill so far and what is left, in rupiah; null when the server sends none. */
  invoicedAmount: number | null;
  remainingAmount: number | null;
}

export interface OrderSummary {
  /** Waiting for the customer's confirmation. */
  awaiting: AmountCount;
  /** Confirmed and ready to be invoiced. */
  ready: AmountCount;
  /** Billed in part, with something left to invoice. */
  partial: AmountCount;
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
  /** Email it again: only once it was sent to the customer. */
  resend: boolean;
  pdf: boolean;
}

/**
 * What an order offers in its current status, as the sales API guide lays it out. COMPLETED is
 * set by making an invoice, never by an order endpoint. Once an invoice exists the order can no
 * longer be edited or cancelled (void the invoice first). Rights are applied separately.
 */
export const orderActions = (order: Pick<SaleOrder, 'status' | 'sale'>): OrderActionSet => {
  const { status } = order;
  const partly = status === 'PARTIALLY_INVOICED';
  return {
    edit: status === 'DRAFT' || status === 'WAITING_CONFIRMATION' || status === 'CONFIRMED',
    send: status === 'DRAFT',
    confirm: status === 'WAITING_CONFIRMATION',
    cancel: status === 'WAITING_CONFIRMATION' || status === 'CONFIRMED',
    remove: status === 'DRAFT',
    duplicate: true,
    createInvoice: status === 'CONFIRMED' || partly,
    viewInvoice: (status === 'COMPLETED' || partly) && Boolean(order.sale),
    resend:
      status === 'WAITING_CONFIRMATION' ||
      status === 'CONFIRMED' ||
      partly ||
      status === 'COMPLETED',
    pdf: true,
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
  resend: actions.resend && rights.update,
  pdf: actions.pdf,
});
