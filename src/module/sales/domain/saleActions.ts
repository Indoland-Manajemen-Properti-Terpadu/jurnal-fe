import type { Sale } from './sale';

/** `disabled` is shown with a reason; `hidden` is not offered at all. */
export type ActionState = 'hidden' | 'disabled' | 'enabled';

export interface SaleActionSet {
  edit: boolean;
  /** Deleting is only for drafts; an issued invoice is voided instead. */
  remove: ActionState;
  send: boolean;
  /** Disabled while the customer has no email address to send to. */
  resend: ActionState;
  pay: boolean;
  pdf: boolean;
  link: boolean;
  /** Offered on an open invoice; disabled for an invoice ProApps created, like delete was. */
  void: ActionState;
}

/** The address an invoice is emailed to: its own, else the customer's. */
export const billingEmail = (sale: Pick<Sale, 'emails' | 'customer'>): string =>
  sale.emails?.find(Boolean) || sale.customer?.emails?.find(Boolean) || '';

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
  sale: Pick<Sale, 'displayStatus' | 'canEdit' | 'canDelete' | 'createdByApi'> &
    Partial<Pick<Sale, 'emails' | 'customer'>>
): SaleActionSet => {
  const { code } = sale.displayStatus;
  const isDraft = code === 'DRAFT';
  const isVoid = code === 'VOID';
  const isOpen = code === 'UNPAID' || code === 'OVERDUE';

  let remove: ActionState = 'hidden';
  if (isDraft) {
    if (sale.canDelete) remove = 'enabled';
    else if (sale.createdByApi) remove = 'disabled';
  }

  let voidState: ActionState = 'hidden';
  if (isOpen) voidState = sale.createdByApi ? 'disabled' : 'enabled';

  let resend: ActionState = 'hidden';
  if (isOpen || code === 'PAID') {
    resend = billingEmail({ emails: sale.emails ?? [], customer: sale.customer ?? null })
      ? 'enabled'
      : 'disabled';
  }

  return {
    edit: isDraft && sale.canEdit,
    remove,
    send: isDraft,
    resend,
    pay: isOpen,
    pdf: !isDraft,
    link: !isDraft && !isVoid,
    void: voidState,
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
  if (actions.resend !== 'hidden') menu.push('resend');
  if (actions.void !== 'hidden') menu.push('void');
  if (actions.remove !== 'hidden') menu.push('remove');

  return { primary, secondary, menu };
};
