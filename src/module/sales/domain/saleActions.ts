import type { Sale } from './sale';

export interface SaleActionSet {
  edit: boolean;
  /** `disabled` is shown with a reason for an invoice ProApps created; `hidden` is not offered. */
  remove: 'hidden' | 'disabled' | 'enabled';
  send: boolean;
  resend: boolean;
  pay: boolean;
  pdf: boolean;
  link: boolean;
  void: boolean;
}

export type HeaderPrimary = 'send' | 'pay';
export type HeaderSecondary = 'edit' | 'pdf';
export type HeaderMenuItem = 'link' | 'resend' | 'void' | 'remove';

/** How the detail header lays the actions out, most to least used. */
export interface HeaderActions {
  /** The one filled button: what normally happens next to this invoice. */
  primary: HeaderPrimary | null;
  /** Quiet buttons that stay visible. */
  secondary: HeaderSecondary[];
  /** Everything else, in the "more actions" menu; destructive items come last. */
  menu: HeaderMenuItem[];
}

/** What a row or the detail page offers. Edit and delete come from the server's own flags. */
export const saleActions = (
  sale: Pick<Sale, 'displayStatus' | 'canEdit' | 'canDelete' | 'createdByApi'>
): SaleActionSet => {
  const { code } = sale.displayStatus;
  const isDraft = code === 'DRAFT';
  const isVoid = code === 'VOID';
  const isOpen = code === 'UNPAID' || code === 'OVERDUE';

  let remove: SaleActionSet['remove'] = 'hidden';
  if (sale.canDelete) remove = 'enabled';
  else if (sale.createdByApi && !isVoid) remove = 'disabled';

  return {
    edit: isDraft && sale.canEdit,
    remove,
    send: isDraft,
    resend: isOpen || code === 'PAID',
    pay: isOpen,
    pdf: !isDraft,
    link: !isDraft && !isVoid,
    void: isOpen,
  };
};

/**
 * The header of the detail page: one primary action, at most one quiet button next to it, and the
 * rest in a menu. The order is fixed so the same invoice state always looks the same.
 */
export const headerActions = (actions: SaleActionSet): HeaderActions => {
  let primary: HeaderPrimary | null = null;
  if (actions.send) primary = 'send';
  else if (actions.pay) primary = 'pay';

  const secondary: HeaderSecondary[] = [];
  if (actions.edit) secondary.push('edit');
  if (actions.pdf) secondary.push('pdf');

  const menu: HeaderMenuItem[] = [];
  if (actions.link) menu.push('link');
  if (actions.resend) menu.push('resend');
  if (actions.void) menu.push('void');
  if (actions.remove !== 'hidden') menu.push('remove');

  return { primary, secondary, menu };
};
