import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import {
  DRAFT_LIMITS,
  draftToInput,
  hasDraftErrors,
  orderToDraft,
  validateDraft,
} from '@/module/purchases/domain/orderDraft';

const order = {
  date: '2026-11-22',
  expectedDate: '2026-12-05',
  warehouse: { id: 'w1', name: 'Gudang Utama' },
  deliveryAddress: 'Jl. Merdeka 1',
  memo: 'Pagi hari',
} as unknown as PurchaseOrder;

describe('orderDraft', () => {
  it('opens with what the order has', () => {
    expect(orderToDraft(order)).toEqual({
      transactionDate: '2026-11-22',
      expectedDate: '2026-12-05',
      warehouseId: 'w1',
      deliveryAddress: 'Jl. Merdeka 1',
      memo: 'Pagi hari',
    });
  });

  it('sends a cleared date and warehouse as null so they are cleared', () => {
    const input = draftToInput({ ...orderToDraft(order), expectedDate: '', warehouseId: '' });
    expect(input).toMatchObject({ expectedDate: null, warehouse: null });
  });

  it('requires the order date and keeps the expected date on or after it', () => {
    expect(validateDraft({ ...orderToDraft(order), transactionDate: '' }).transactionDate).toBe(
      'required'
    );
    expect(validateDraft({ ...orderToDraft(order), expectedDate: '2026-11-01' }).expectedDate).toBe(
      'beforeDate'
    );
    expect(validateDraft({ ...orderToDraft(order), expectedDate: '2026-11-22' })).toEqual({});
    expect(hasDraftErrors(validateDraft(orderToDraft(order)))).toBe(false);
  });

  it('keeps the texts within what the service takes', () => {
    const errors = validateDraft({
      ...orderToDraft(order),
      deliveryAddress: 'a'.repeat(DRAFT_LIMITS.address + 1),
      memo: 'm'.repeat(DRAFT_LIMITS.memo + 1),
    });
    expect(errors).toEqual({ deliveryAddress: 'tooLong', memo: 'tooLong' });
    expect(
      validateDraft({
        ...orderToDraft(order),
        deliveryAddress: 'a'.repeat(DRAFT_LIMITS.address),
        memo: 'm'.repeat(DRAFT_LIMITS.memo),
      })
    ).toEqual({});
  });
});
