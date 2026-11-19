import type { Sale } from './sale';

/**
 * An invoice with an issued return is locked: it cannot be voided, and its lines, discount,
 * withholding and tax mode cannot change (memo and references stay editable). A return that
 * settles as customer credit leaves `returnedAmount` at 0, so the quantities count too.
 * The server enforces the lock; this only lets the screens say so before the user tries.
 */
export const hasIssuedReturn = (sale: Pick<Sale, 'returnedAmount' | 'items'>): boolean =>
  (sale.returnedAmount ?? 0) > 0 || sale.items.some((item) => (item.returnedQty ?? 0) > 0);
