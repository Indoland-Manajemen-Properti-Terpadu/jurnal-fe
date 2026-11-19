import type { AmountCount, SaleDocHeader, SaleDocListParams } from './saleDocument';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'VOID';

/** What the badge shows: the stored status, or EXPIRED for a sent quote past its valid-until day. */
export type QuoteDisplayStatus = QuoteStatus | 'EXPIRED';

export const QUOTE_TABS = ['running', 'accepted', 'finished'] as const;
export type QuoteTab = (typeof QUOTE_TABS)[number];

/** Status filters inside a tab; "running" mixes drafts and quotes waiting for an answer. */
export const QUOTE_STATUS_FILTERS: Record<QuoteTab, QuoteDisplayStatus[]> = {
  running: ['DRAFT', 'SENT'],
  accepted: [],
  finished: ['REJECTED', 'EXPIRED', 'VOID'],
};

export interface SaleQuote extends SaleDocHeader {
  validUntil: string | null;
  status: QuoteStatus;
  /** Calculated by the server (Jakarta day); never worked out on the client. */
  displayStatus: QuoteDisplayStatus;
  /** Id of the active order made from this quote. */
  order: string | null;
  emails: string[];
  sentAt: string | null;
  acceptedAt: string | null;
  attachmentCount: number;
}

export interface QuoteSummary {
  awaiting: AmountCount;
  accepted: AmountCount;
  counts: Record<QuoteTab, number>;
  /** Accepted over accepted, rejected and expired; null while nothing was answered. */
  conversionRate: number | null;
}

export type QuoteListParams = SaleDocListParams<QuoteTab, QuoteDisplayStatus>;

export interface QuoteActionSet {
  edit: boolean;
  send: boolean;
  remove: boolean;
  accept: boolean;
  reject: boolean;
  revise: boolean;
  resend: boolean;
  /** Cancel a quote that was sent; a draft is deleted instead. */
  cancel: boolean;
  duplicate: boolean;
  createOrder: boolean;
  viewOrder: boolean;
}

/**
 * What a quote offers in its current state, as the sales API guide lays it out. The server still
 * decides and a refusal is shown to the user; rights are applied separately by the screens.
 */
export const quoteActions = (
  quote: Pick<SaleQuote, 'status' | 'displayStatus' | 'order'>
): QuoteActionSet => {
  const { status, order } = quote;
  const expired = quote.displayStatus === 'EXPIRED';
  const waiting = status === 'SENT' && !expired;
  return {
    edit: status === 'DRAFT',
    send: status === 'DRAFT',
    remove: status === 'DRAFT',
    accept: waiting,
    reject: waiting,
    revise: status === 'SENT',
    resend: waiting || status === 'ACCEPTED',
    cancel: status === 'SENT',
    duplicate: true,
    createOrder: status === 'ACCEPTED' && !order,
    viewOrder: status === 'ACCEPTED' && Boolean(order),
  };
};

export const QUOTE_MAX_EMAILS = 10;
export const QUOTE_MAX_MESSAGE = 2000;

/** What the signed-in user may do with quotes, from the menu rights. */
export interface QuoteRights {
  create: boolean;
  update: boolean;
  delete: boolean;
  /** Making an order from a quote needs create on orders; opening it needs read. */
  orderCreate: boolean;
  orderRead: boolean;
}

/**
 * Narrows the actions of a status to the user's rights: changing, sending and answering need
 * update, cancelling and deleting need delete, copying needs create. Viewing needs only read, which
 * the page itself requires. The server remains the authority.
 */
export const allowedQuoteActions = (
  actions: QuoteActionSet,
  rights: QuoteRights
): QuoteActionSet => ({
  edit: actions.edit && rights.update,
  send: actions.send && rights.update,
  accept: actions.accept && rights.update,
  reject: actions.reject && rights.update,
  revise: actions.revise && rights.update,
  resend: actions.resend && rights.update,
  cancel: actions.cancel && rights.delete,
  remove: actions.remove && rights.delete,
  duplicate: actions.duplicate && rights.create,
  createOrder: actions.createOrder && rights.orderCreate,
  viewOrder: actions.viewOrder && rights.orderRead,
});
