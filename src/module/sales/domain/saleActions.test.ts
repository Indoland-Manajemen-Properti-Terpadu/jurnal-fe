import { describe, expect, it } from 'vitest';
import type { SaleDisplayCode } from './sale';
import { headerActions, saleActions } from './saleActions';

const sale = (
  code: SaleDisplayCode,
  flags: { canEdit?: boolean; canDelete?: boolean; createdByApi?: boolean } = {}
) => ({
  displayStatus: { code, label: code },
  canEdit: flags.canEdit ?? false,
  canDelete: flags.canDelete ?? false,
  createdByApi: flags.createdByApi ?? false,
});

describe('saleActions', () => {
  it('lets a draft be edited, deleted and sent, never paid or voided', () => {
    expect(saleActions(sale('DRAFT', { canEdit: true, canDelete: true }))).toMatchObject({
      edit: true,
      remove: 'enabled',
      send: true,
      resend: false,
      pay: false,
      void: false,
    });
  });

  it('lets an unpaid invoice be paid, resent and voided, not edited', () => {
    expect(saleActions(sale('UNPAID'))).toMatchObject({
      edit: false,
      send: false,
      pay: true,
      resend: true,
      void: true,
      pdf: true,
      link: true,
    });
  });

  it('keeps an overdue invoice payable', () => {
    expect(saleActions(sale('OVERDUE')).pay).toBe(true);
  });

  it('does not offer payment on a paid invoice', () => {
    expect(saleActions(sale('PAID'))).toMatchObject({ pay: false, void: false, pdf: true });
  });

  it('offers only the PDF on a void invoice', () => {
    expect(saleActions(sale('VOID'))).toEqual({
      edit: false,
      remove: 'hidden',
      send: false,
      resend: false,
      pay: false,
      pdf: true,
      link: false,
      void: false,
    });
  });

  it('shows delete disabled for an invoice created from ProApps', () => {
    expect(saleActions(sale('UNPAID', { createdByApi: true })).remove).toBe('disabled');
  });

  it('hides delete when the server forbids it and the invoice is not from ProApps', () => {
    expect(saleActions(sale('UNPAID', { canDelete: false })).remove).toBe('hidden');
  });
});

describe('headerActions', () => {
  const layout = (code: SaleDisplayCode, flags = {}) =>
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
    expect(layout('OVERDUE', { canDelete: true }).menu).toEqual([
      'link',
      'resend',
      'void',
      'remove',
    ]);
  });

  it('a paid invoice has no filled button; a void one has no menu', () => {
    expect(layout('PAID')).toEqual({ primary: null, secondary: ['pdf'], menu: ['link', 'resend'] });
    expect(layout('VOID')).toEqual({ primary: null, secondary: ['pdf'], menu: [] });
  });

  it('keeps an undeletable ProApps invoice in the menu so it can say why', () => {
    expect(layout('DRAFT', { canEdit: true, createdByApi: true }).menu).toEqual(['remove']);
  });
});
