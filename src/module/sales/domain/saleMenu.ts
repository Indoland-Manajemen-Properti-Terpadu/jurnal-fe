/**
 * Menu ids the sales backend checks, one per document. Each endpoint needs its menu and the
 * matching right (create, read, update, delete); the server stays the authority.
 */
export const SALE_MENU = {
  invoices: 'JP-SALES',
  quotes: 'JP-SALES-QUOTE',
  orders: 'JP-SALES-ORDER',
  returns: 'JP-SALES-RETURN',
  reports: 'JP-SALES-RPT',
} as const;

export type SaleMenu = (typeof SALE_MENU)[keyof typeof SALE_MENU];
