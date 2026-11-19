import { describe, expect, it } from 'vitest';
import type { Sale } from './sale';
import { allowedReturnActions, returnActions, type SaleReturn } from './saleReturn';
import {
  canReturnSale,
  canSaveReturn,
  emptyReturnForm,
  returnAll,
  returnLinesOf,
  returnToFormValues,
  validateReturnForm,
} from './saleReturnForm';

type State = Parameters<typeof returnActions>[0];
const state = (patch: Partial<State> = {}): State => ({
  status: 'POSTED',
  creditRemaining: 0,
  creditUsed: 0,
  refundAmount: 0,
  applications: [],
  ...patch,
});

describe('returnActions', () => {
  it('lets a draft be edited, issued and deleted, and nothing else', () => {
    const actions = returnActions(state({ status: 'DRAFT' }));
    expect(Object.entries(actions).filter(([, on]) => on)).toEqual([
      ['edit', true],
      ['issue', true],
      ['remove', true],
    ]);
  });

  it('lets an issued return be cancelled, and offers credit actions while credit is left', () => {
    expect(returnActions(state())).toMatchObject({
      cancel: true,
      applyCredit: false,
      refund: false,
    });
    expect(returnActions(state({ creditRemaining: 100 }))).toMatchObject({
      applyCredit: true,
      refund: true,
    });
  });

  it('blocks cancelling once credit is used or refunded, and offers to take that back', () => {
    const used = returnActions(
      state({
        creditUsed: 50,
        applications: [
          { id: 'a', sale: 's', saleNumber: 'S', amount: 50, appliedAt: null, voided: false },
        ],
      })
    );
    expect(used).toMatchObject({ cancel: true, cancelBlocked: true, cancelApplication: true });
    expect(returnActions(state({ refundAmount: 10 }))).toMatchObject({
      cancelBlocked: true,
      cancelRefund: true,
    });
  });

  it('does not offer taking back an application that was already voided', () => {
    const voided = state({
      applications: [
        { id: 'a', sale: 's', saleNumber: 'S', amount: 50, appliedAt: null, voided: true },
      ],
    });
    expect(returnActions(voided).cancelApplication).toBe(false);
  });

  it('offers nothing on a cancelled return', () => {
    const actions = returnActions(state({ status: 'VOID' }));
    expect(Object.values(actions).some(Boolean)).toBe(false);
  });
});

describe('allowedReturnActions', () => {
  it('asks for update to issue, apply and refund and for delete to cancel and remove', () => {
    const full = returnActions(state({ creditRemaining: 100, refundAmount: 1 }));
    const none = allowedReturnActions(full, { create: true, update: false, delete: false });
    expect(none).toMatchObject({
      applyCredit: false,
      refund: false,
      cancel: false,
      cancelRefund: false,
    });
    const del = allowedReturnActions(full, { create: false, update: false, delete: true });
    expect(del).toMatchObject({ cancel: true, cancelRefund: true, applyCredit: false });
  });
});

const invoice = {
  id: 's-1',
  transactionDate: '2026-11-06T00:00:00.000Z',
  displayStatus: { code: 'UNPAID', label: 'Belum Lunas' },
  items: [
    {
      _id: 'i-1',
      quantity: 5,
      unitPrice: 45000,
      amount: 225000,
      returnedQty: 2,
      product: { id: 'p', name: 'Claude' },
    },
    {
      _id: 'i-2',
      quantity: 1,
      unitPrice: 30000,
      amount: 30000,
      product: { id: 'p2', name: 'Netflix' },
    },
    { quantity: 1, unitPrice: 1, amount: 1 },
  ],
} as unknown as Sale;

describe('return form', () => {
  it('lists the invoice lines with what is left to return', () => {
    const lines = returnLinesOf(invoice);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({
      saleItem: 'i-1',
      quantity: 5,
      returned: 2,
      remaining: 3,
      returnQty: 0,
    });
    expect(lines[1]).toMatchObject({ remaining: 1 });
  });

  it('reads the line id the mapper gives a stored invoice (id, not _id)', () => {
    const mapped = {
      items: [{ id: 'm-1', quantity: 2, unitPrice: 10, amount: 20 }],
    } as unknown as Sale;
    expect(returnLinesOf(mapped)[0]).toMatchObject({ saleItem: 'm-1', remaining: 2 });
  });

  it('takes back everything that is left with one click', () => {
    expect(returnAll(returnLinesOf(invoice)).map((l) => l.returnQty)).toEqual([3, 1]);
  });

  it('needs a quantity, within what is left, and a date not before the invoice', () => {
    const empty = emptyReturnForm(invoice, '2026-11-19');
    expect(validateReturnForm(empty, invoice.transactionDate)).toEqual({
      lines: 'validation.linesRequired',
    });
    const over = {
      ...empty,
      lines: empty.lines.map((l, i) => ({ ...l, returnQty: i === 0 ? 4 : 0 })),
    };
    expect(validateReturnForm(over, invoice.transactionDate)['lines.0']).toBe(
      'validation.quantityOver'
    );
    const early = { ...empty, transactionDate: '2026-11-01', lines: returnAll(empty.lines) };
    expect(validateReturnForm(early, invoice.transactionDate)).toEqual({
      transactionDate: 'validation.dateBeforeInvoice',
    });
    expect(
      canSaveReturn({ ...empty, lines: returnAll(empty.lines) }, invoice.transactionDate)
    ).toBe(true);
  });

  it('fills a stored draft back in with its quantities', () => {
    const draft = {
      transactionDate: '2026-11-19T00:00:00.000Z',
      reason: 'Komplain kualitas',
      settlement: 'CUSTOMER_CREDIT',
      memo: 'm',
      items: [{ saleItem: 'i-1', quantity: 2 }],
    } as unknown as SaleReturn;
    const values = returnToFormValues(draft, invoice);
    expect(values).toMatchObject({
      sale: 's-1',
      transactionDate: '2026-11-19',
      reason: 'Komplain kualitas',
      settlement: 'CUSTOMER_CREDIT',
    });
    expect(values.lines.map((l) => l.returnQty)).toEqual([2, 0]);
  });

  it('only corrects an issued invoice', () => {
    const at = (code: string) => canReturnSale({ displayStatus: { code, label: '' } } as Sale);
    expect(at('UNPAID') && at('OVERDUE') && at('PAID')).toBe(true);
    expect(at('DRAFT') || at('VOID')).toBe(false);
  });
});
