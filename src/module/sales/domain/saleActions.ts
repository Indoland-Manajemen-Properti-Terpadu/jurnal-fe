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
