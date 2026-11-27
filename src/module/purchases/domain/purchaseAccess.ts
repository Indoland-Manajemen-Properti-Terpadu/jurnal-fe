export type MenuAction = 'create' | 'read' | 'update' | 'delete';

/**
 * Menu ids the purchasing backend checks. The approval menus are not set by hand in Roles: the
 * backend grants them to the roles chosen in Settings > Alur Persetujuan.
 */
export const PURCHASE_MENU = {
  /** Procurement (quotes = update, create order = create), orders, bills. */
  documents: 'JP-PURCH',
  /** The requester's own FPPBJ. */
  request: 'JP-PURCH-FPPBJ',
  /** Accounting: sees every FPPBJ, verifies or returns (update), cancels (delete). */
  requestVerify: 'JP-PURCH-FPPBJ-VER',
  /** Goods receipts (FPB) and service receipts (BAPP). */
  receipts: 'JP-PURCH-RCV',
  returns: 'JP-PURCH-RET',
  paymentRequests: 'JP-PURCH-PAYREQ',
  /** Payment vouchers (cashier). */
  payments: 'JP-PURCH-PAY',
  approveProcurement: 'JP-PURCH-APR-PROC',
  approveReceipt: 'JP-PURCH-APR-BAPP',
  approvePayment: 'JP-PURCH-APR-PAY',
  approvePriceChange: 'JP-PURCH-APR-PRICE',
  reports: 'JP-PURCH-RPT',
  /** Releasing the retention held on an SPK/PO (only `create`). */
  retentionRelease: 'JP-PURCH-RETREL',
} as const;

export type PurchaseMenu = (typeof PURCHASE_MENU)[keyof typeof PURCHASE_MENU];

export interface PurchaseAccessProfile {
  isSuperAdmin: boolean;
  rights: Partial<Record<string, Partial<Record<MenuAction, boolean>>>>;
}

export const canAccess = (
  profile: PurchaseAccessProfile,
  menu: PurchaseMenu,
  action: MenuAction
): boolean => profile.isSuperAdmin || profile.rights[menu]?.[action] === true;

/** Reading a list is allowed with the document menu or with the matching approval menu. */
export const canReadPurchasing = (profile: PurchaseAccessProfile): boolean =>
  (Object.values(PURCHASE_MENU) as PurchaseMenu[]).some((menu) => canAccess(profile, menu, 'read'));
