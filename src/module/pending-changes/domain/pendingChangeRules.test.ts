import type { PendingChangeItem } from './pendingChange';
import {
  countByType,
  findGenericAmount,
  isDeletionChange,
  isFineChange,
  isPaymentChange,
  parseChangeNotes,
  visiblePayloadEntries,
} from './pendingChangeRules';

const change = (overrides: Partial<PendingChangeItem> = {}): PendingChangeItem => ({
  id: 'c1',
  type: 'OTHER',
  referenceModel: 'Sale',
  referenceId: 's1',
  payload: {},
  status: 'PENDING',
  ...overrides,
});

describe('change type rules', () => {
  it('recognises fine and payment types', () => {
    expect(isFineChange(change({ type: 'FINE' }))).toBe(true);
    expect(isPaymentChange(change({ type: 'SALE_PAYMENT' }))).toBe(true);
    expect(isFineChange(change({ type: 'SALE_PAYMENT' }))).toBe(false);
  });

  it('detects deletions from the type name, the payload action or the deleted flag', () => {
    expect(isDeletionChange(change({ type: 'invoice_void' }))).toBe(true);
    expect(isDeletionChange(change({ type: 'SALE_DELETE' }))).toBe(true);
    expect(isDeletionChange(change({ payload: { action: 'DELETE' } }))).toBe(true);
    expect(isDeletionChange(change({ deleted: true }))).toBe(true);
    expect(isDeletionChange(change())).toBe(false);
  });

  it('counts fines and payments in a list', () => {
    const items = [
      change({ type: 'FINE' }),
      change({ type: 'FINE' }),
      change({ type: 'SALE_PAYMENT' }),
    ];

    expect(countByType(items)).toEqual({ fine: 2, payment: 1 });
  });
});

describe('parseChangeNotes', () => {
  it('returns nulls for empty notes', () => {
    expect(parseChangeNotes(undefined)).toEqual({
      invoiceNo: null,
      customerCode: null,
      description: null,
    });
  });

  it('extracts the invoice number and customer code and keeps the rest as description', () => {
    expect(parseChangeNotes('Invoice: INV-001, Pelanggan: C-77 Denda bulan Mei')).toEqual({
      invoiceNo: 'INV-001',
      customerCode: 'C-77',
      description: 'Denda bulan Mei',
    });
  });

  it('keeps the whole text when there is nothing to extract', () => {
    expect(parseChangeNotes('Penyesuaian manual')).toEqual({
      invoiceNo: null,
      customerCode: null,
      description: 'Penyesuaian manual',
    });
  });

  it('falls back to the full notes when only the codes were present', () => {
    expect(parseChangeNotes('Invoice: INV-9').description).toBe('Invoice: INV-9');
  });
});

describe('payload helpers', () => {
  it('prefers amount, then nominal, then total', () => {
    expect(findGenericAmount(change({ payload: { nominal: 5, total: 9 } }))).toEqual({ value: 5 });
    expect(findGenericAmount(change({ payload: { total: 9 } }))).toEqual({ value: 9 });
    expect(findGenericAmount(change({ payload: { other: 1 } }))).toBeUndefined();
  });

  it('hides bookkeeping fields from the visible entries', () => {
    const entries = visiblePayloadEntries(
      change({ payload: { state: 'x', syncDate: 'd', _id: '1', __v: 0, a: 1 } })
    );

    expect(entries).toEqual([
      ['state', 'x'],
      ['a', 1],
    ]);
  });
});
