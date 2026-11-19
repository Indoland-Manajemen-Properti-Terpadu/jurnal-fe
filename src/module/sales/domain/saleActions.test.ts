import { describe, expect, it } from 'vitest';
import type { SaleDisplayCode } from './sale';
import { billingEmail, headerActions, saleActions } from './saleActions';

type Flags = {
  canEdit?: boolean;
  canDelete?: boolean;
  createdByApi?: boolean;
  /** Defaults to one address; pass `[]` for an invoice nobody can be emailed about. */
  emails?: string[];
};

const sale = (code: SaleDisplayCode, flags: Flags = {}) => ({
  displayStatus: { code, label: code },
  canEdit: flags.canEdit ?? false,
  canDelete: flags.canDelete ?? false,
  createdByApi: flags.createdByApi ?? false,
  emails: flags.emails ?? ['pelanggan@contoh.id'],
  customer: null,
});

describe('saleActions', () => {
  it('lets a draft be edited, deleted and sent, never paid or voided', () => {
    expect(saleActions(sale('DRAFT', { canEdit: true, canDelete: true }))).toMatchObject({
      edit: true,
      remove: 'enabled',
      send: true,
      resend: 'hidden',
      pay: false,
      void: 'hidden',
    });
  });

  it('lets an unpaid invoice be paid, resent and voided, not edited or deleted', () => {
    expect(saleActions(sale('UNPAID', { canDelete: true }))).toMatchObject({
      edit: false,
      remove: 'hidden',
      send: false,
      pay: true,
      resend: 'enabled',
      void: 'enabled',
      pdf: true,
      link: true,
    });
  });

  it('keeps an overdue invoice payable', () => {
    expect(saleActions(sale('OVERDUE')).pay).toBe(true);
  });

  it('does not offer payment or void on a paid invoice', () => {
    expect(saleActions(sale('PAID'))).toMatchObject({
      pay: false,
      void: 'hidden',
      resend: 'enabled',
      pdf: true,
    });
  });

  it('offers only the PDF on a void invoice', () => {
    expect(saleActions(sale('VOID'))).toEqual({
      edit: false,
      remove: 'hidden',
      send: false,
      resend: 'hidden',
      pay: false,
      pdf: true,
      link: false,
      void: 'hidden',
      voidBlockedBy: null,
      voidBlockedReason: '',
    });
  });

  it('disables resend, with the action still shown, when nobody can be emailed', () => {
    expect(saleActions(sale('UNPAID', { emails: [] })).resend).toBe('disabled');
    expect(saleActions(sale('PAID', { emails: [''] })).resend).toBe('disabled');
  });

  it('uses the customer address when the invoice has none of its own', () => {
    const withCustomer = {
      ...sale('UNPAID', { emails: [] }),
      customer: { id: 'c', displayName: 'C', emails: ['c@contoh.id'] },
    };
    expect(billingEmail(withCustomer)).toBe('c@contoh.id');
    expect(saleActions(withCustomer).resend).toBe('enabled');
  });

  it('disables void for an invoice created from ProApps, as delete used to be', () => {
    expect(saleActions(sale('UNPAID', { createdByApi: true })).void).toBe('disabled');
    expect(saleActions(sale('OVERDUE', { createdByApi: true })).void).toBe('disabled');
  });

  it('only a draft can be deleted: disabled for ProApps, hidden once issued', () => {
    expect(saleActions(sale('DRAFT', { createdByApi: true })).remove).toBe('disabled');
    expect(saleActions(sale('DRAFT')).remove).toBe('hidden');
    expect(saleActions(sale('UNPAID', { createdByApi: true, canDelete: true })).remove).toBe(
      'hidden'
    );
  });
});

describe('headerActions', () => {
  const layout = (code: SaleDisplayCode, flags: Flags = {}) =>
    headerActions(saleActions(sale(code, flags)));

  it('a draft: send first, edit beside it, delete in the menu', () => {
    expect(layout('DRAFT', { canEdit: true, canDelete: true })).toEqual({
      primary: 'send',
      secondary: ['edit'],
      menu: ['remove'],
    });
  });

  it('an open invoice: pay first, the PDF beside it, the rest in the menu with void last', () => {
    expect(layout('UNPAID')).toEqual({
      primary: 'pay',
      secondary: ['pdf'],
      menu: ['link', 'resend', 'void'],
    });
  });

  it('a paid invoice has no filled button; a void one has no menu', () => {
    expect(layout('PAID')).toEqual({ primary: null, secondary: ['pdf'], menu: ['link', 'resend'] });
    expect(layout('VOID')).toEqual({ primary: null, secondary: ['pdf'], menu: [] });
  });

  it('keeps disabled items in the menu so they can say why', () => {
    expect(layout('DRAFT', { canEdit: true, createdByApi: true }).menu).toEqual(['remove']);
    expect(layout('UNPAID', { createdByApi: true, emails: [] }).menu).toEqual([
      'link',
      'resend',
      'void',
    ]);
  });
});

describe('saleActions with an issued return', () => {
  const open = {
    displayStatus: { code: 'UNPAID' as const, label: 'Belum Lunas' },
    canEdit: false,
    canDelete: false,
    createdByApi: false,
  };
  const item = (returnedQty?: number) => ({
    quantity: 2,
    unitPrice: 100,
    amount: 200,
    returnedQty,
  });

  it('disables void with the return as the reason, but keeps paying', () => {
    const actions = saleActions({ ...open, returnedAmount: 50, items: [item()] });
    expect(actions.void).toBe('disabled');
    expect(actions.voidBlockedBy).toBe('return');
    expect(actions.pay).toBe(true);
  });

  it('counts a credit-only return, which leaves the amount at 0', () => {
    const actions = saleActions({ ...open, returnedAmount: 0, items: [item(1)] });
    expect(actions.voidBlockedBy).toBe('return');
  });

  it('names the integration as the reason when there is no return', () => {
    expect(saleActions({ ...open, createdByApi: true, items: [item(0)] }).voidBlockedBy).toBe(
      'api'
    );
    expect(saleActions({ ...open, items: [item(0)] })).toMatchObject({
      void: 'enabled',
      voidBlockedBy: null,
    });
  });

  it("follows the server's own void decision and passes its reason on", () => {
    const blocked = saleActions({
      ...open,
      items: [item(0)],
      canVoid: false,
      voidBlockedReason: 'Faktur sudah punya pembayaran.',
    });
    expect(blocked).toMatchObject({
      void: 'disabled',
      voidBlockedBy: 'server',
      voidBlockedReason: 'Faktur sudah punya pembayaran.',
    });
    expect(saleActions({ ...open, items: [item(0)], canVoid: true }).void).toBe('enabled');
  });
});
