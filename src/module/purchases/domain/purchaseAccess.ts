export type MenuAction = 'create' | 'read' | 'update' | 'delete';

/** Menu ids the purchasing backend checks (see the module README). */
export const PURCHASE_MENU = {
  documents: 'JP-PURCH',
  payments: 'JP-PURCH-PAY',
  approvePurchaseRequest: 'JP-PURCH-APR-PR',
  approvePurchaseOrder: 'JP-PURCH-APR-PO',
  approvePayment: 'JP-PURCH-APR-PAY',
  reports: 'JP-PURCH-RPT',
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
