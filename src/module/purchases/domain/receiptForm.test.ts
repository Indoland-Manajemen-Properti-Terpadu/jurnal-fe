import type { OrderItem, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import {
  canReceive,
  clampReceived,
  emptyReceiptForm,
  hasReceiptErrors,
  receiptLines,
  receiveAllRemaining,
  toReceiptInput,
  validateReceipt,
} from '@/module/purchases/domain/receiptForm';

const item = (id: string, quantity: number, receivedQty: number): OrderItem => ({
  id,
  requestItemId: `r-${id}`,
  product: null,
  description: `Barang ${id}`,
  quantity,
  unitName: null,
  unitPrice: 1000,
  tax: null,
  discountAmount: 0,
  taxAmount: 0,
  amount: quantity * 1000,
  receivedQty,
  billedQty: 0,
});

const order = (items: OrderItem[], status: PurchaseOrder['status'] = 'APPROVED') =>
  ({ id: 'po1', date: '2026-11-01', status, items }) as unknown as PurchaseOrder;

describe('receiptForm', () => {
  it('only approved or partly received orders can take a receipt', () => {
    expect(canReceive(order([], 'APPROVED'))).toBe(true);
    expect(canReceive(order([], 'PARTIAL_RECEIVED'))).toBe(true);
    expect(canReceive(order([], 'RECEIVED'))).toBe(false);
    expect(canReceive(order([], 'DRAFT'))).toBe(false);
  });

  it('computes what is still open per line', () => {
    const lines = receiptLines(order([item('a', 10, 3.5), item('b', 2, 2)]));
    expect(lines.map((line) => line.remaining)).toEqual([6.5, 0]);
  });

  it('starts empty so nothing is received by accident', () => {
    const form = emptyReceiptForm(order([item('a', 4, 0)]), '2026-11-05');
    expect(form.quantities).toEqual({ a: 0 });
    expect(
      hasReceiptErrors(
        validateReceipt(form, order([item('a', 4, 0)]), receiptLines(order([item('a', 4, 0)])))
      )
    ).toBe(true);
  });

  it('clamps input to the open quantity and never below zero', () => {
    expect(clampReceived(9, 4)).toBe(4);
    expect(clampReceived(-1, 4)).toBe(0);
    expect(clampReceived('abc', 4)).toBe(0);
    expect(clampReceived(1.23456, 4)).toBe(1.2346);
  });

  it('flags a date before the order, no quantity and an over-receipt', () => {
    const po = order([item('a', 4, 1)]);
    const lines = receiptLines(po);
    const base = emptyReceiptForm(po, '2026-10-31');
    expect(validateReceipt(base, po, lines).date).toBe('beforeOrder');
    expect(validateReceipt({ ...base, date: '' }, po, lines).date).toBe('required');
    expect(validateReceipt({ ...base, date: '2026-11-05' }, po, lines).noQuantity).toBe(true);
    const over = validateReceipt({ ...base, date: '2026-11-05', quantities: { a: 9 } }, po, lines);
    expect(over.overIds).toEqual(['a']);
  });

  it('builds the payload from lines above zero only and trims optional text', () => {
    const po = order([item('a', 4, 0), item('b', 2, 0)]);
    const lines = receiptLines(po);
    const form = {
      ...receiveAllRemaining(emptyReceiptForm(po, '2026-11-05'), lines),
      deliveryNote: ' SJ-1 ',
      quantities: { a: 3, b: 0 },
    };
    expect(toReceiptInput(form, 'po1')).toEqual({
      purchaseOrder: 'po1',
      transactionDate: '2026-11-05',
      deliveryNote: 'SJ-1',
      items: [{ purchaseOrderItem: 'a', receivedQty: 3 }],
    });
  });
});
