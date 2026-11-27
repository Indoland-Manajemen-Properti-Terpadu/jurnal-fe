import type { OrderItem, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import {
  canReceive,
  clampReceived,
  defaultWarehouse,
  needsWarehouse,
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
  specification: '',
  billOnly: false,
  schedule: { kind: 'FULL', seq: 1, of: 1, periodFrom: null, periodTo: null },
});

const order = (
  items: OrderItem[],
  status: PurchaseOrder['status'] = 'WAITING_RECEIPT',
  withReceipt = true
) =>
  ({
    id: 'po1',
    date: '2026-11-01',
    status,
    items,
    withReceipt,
    advance: { available: 0 },
  }) as unknown as PurchaseOrder;

describe('receiptForm', () => {
  it('only eligible order states with open quantity can take a receipt', () => {
    const openItem = item('a', 1, 0);
    expect(canReceive(order([openItem], 'WAITING_RECEIPT'))).toBe(true);
    expect(canReceive(order([openItem], 'WAITING_RECEIPT', false))).toBe(false);
    expect(canReceive(order([openItem], 'PARTIAL_RECEIVED'))).toBe(true);
    expect(canReceive(order([openItem], 'WAITING_ADVANCE'))).toBe(false);
    expect(
      canReceive({
        ...order([openItem], 'WAITING_ADVANCE'),
        advanceState: { paid: true, receiptAllowed: true },
      } as PurchaseOrder)
    ).toBe(true);
    expect(canReceive(order([openItem], 'RECEIVED'))).toBe(false);
    expect(canReceive(order([openItem], 'DRAFT'))).toBe(false);
    expect(canReceive(order([openItem], 'SENT'))).toBe(false);
  });

  it('computes what is still open per line', () => {
    const lines = receiptLines(order([item('a', 10, 3.5), item('b', 2, 2)]));
    expect(lines.map((line) => line.remaining)).toEqual([6.5, 0]);
  });

  it('keeps the order line description so service installments can be distinguished', () => {
    const line = {
      ...item('a', 1, 0),
      product: { name: 'Jasa instalasi' } as OrderItem['product'],
      description: 'Jasa instalasi — Termin 1 dari 3',
    };
    expect(receiptLines(order([line]))[0].name).toBe('Jasa instalasi — Termin 1 dari 3');
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

  it('skips the lines that are only billed, like an advance, and marks stocked goods', () => {
    const advance = { ...item('adv', 1, 0), billOnly: true };
    const stocked = { ...item('s', 5, 0), product: { id: 'p', name: 'Claude', isInventory: true } };
    const lines = receiptLines(order([advance, stocked as unknown as OrderItem, item('a', 2, 0)]));

    expect(lines.map((line) => [line.itemId, line.stocked])).toEqual([
      ['s', true],
      ['a', false],
    ]);
  });

  describe('the warehouse', () => {
    const stockedOrder = () => {
      const stocked = {
        ...item('s', 5, 0),
        product: { id: 'p', name: 'Claude', isInventory: true },
      };
      return order([stocked as unknown as OrderItem]);
    };

    it('starts from the order warehouse, or the only active one, else blank', () => {
      expect(defaultWarehouse({ warehouse: { id: 'w1' } } as unknown as PurchaseOrder, [])).toBe(
        'w1'
      );
      expect(
        defaultWarehouse({ warehouse: null } as unknown as PurchaseOrder, [{ id: 'w2' }])
      ).toBe('w2');
      expect(
        defaultWarehouse({ warehouse: null } as unknown as PurchaseOrder, [
          { id: 'a' },
          { id: 'b' },
        ])
      ).toBe('');
    });

    it('is required only for stocked goods when more than one warehouse is active', () => {
      const po = stockedOrder();
      const lines = receiptLines(po);
      const form = { ...emptyReceiptForm(po, '2026-11-05'), quantities: { s: 2 } };

      expect(needsWarehouse(po, lines, form, 2)).toBe(true);
      expect(needsWarehouse(po, lines, form, 1)).toBe(false);
      expect(needsWarehouse(po, lines, { ...form, quantities: { s: 0 } }, 2)).toBe(false);
      expect(validateReceipt(form, po, lines, 2).warehouse).toBe(true);
      expect(validateReceipt({ ...form, warehouseId: 'w1' }, po, lines, 2).warehouse).toBe(false);
    });

    it('is never asked for a service', () => {
      const po = { ...stockedOrder(), isService: true } as PurchaseOrder;
      const form = { ...emptyReceiptForm(po, '2026-11-05'), quantities: { s: 1 } };
      expect(needsWarehouse(po, receiptLines(po), form, 3)).toBe(false);
    });
  });

  it('sends the warehouse and the rejected quantity only when there is one', () => {
    const po = order([item('a', 4, 0), item('b', 2, 0)]);
    const form = {
      ...emptyReceiptForm(po, '2026-11-05', 'w1'),
      quantities: { a: 3, b: 1 },
      rejected: { a: 1, b: 0 },
    };

    expect(toReceiptInput(form, 'po1')).toEqual({
      purchaseOrder: 'po1',
      transactionDate: '2026-11-05',
      warehouse: 'w1',
      items: [
        { purchaseOrderItem: 'a', receivedQty: 3, rejectedQty: 1 },
        { purchaseOrderItem: 'b', receivedQty: 1 },
      ],
    });
  });
});

describe('a service receipt (BAPP)', () => {
  const service = () => ({ ...order([item('a', 4, 0)]), isService: true }) as PurchaseOrder;
  const file = (name: string) => new File(['x'], name, { type: 'application/pdf' });

  it('starts without a file and without a number', () => {
    const form = emptyReceiptForm(service(), '2026-11-05');
    expect(form.files).toEqual([]);
    expect(form.deliveryNote).toBe('');
  });

  it('asks for the BAPP number and the signed file, and for nothing more than that', () => {
    const po = service();
    const form = { ...emptyReceiptForm(po, '2026-11-05'), quantities: { a: 1 } };
    const errors = validateReceipt(form, po, receiptLines(po));

    expect(errors.deliveryNote).toBe(true);
    expect(errors.files).toBe(true);
    expect(hasReceiptErrors(errors)).toBe(true);
  });

  it('is complete with the number and one file', () => {
    const po = service();
    const form = {
      ...emptyReceiptForm(po, '2026-11-05'),
      quantities: { a: 1 },
      deliveryNote: 'BAPP-001',
      files: [file('bapp.pdf')],
    };

    expect(hasReceiptErrors(validateReceipt(form, po, receiptLines(po)))).toBe(false);
  });

  it('does not accept a number of only spaces', () => {
    const po = service();
    const form = {
      ...emptyReceiptForm(po, '2026-11-05'),
      quantities: { a: 1 },
      deliveryNote: '   ',
      files: [file('bapp.pdf')],
    };

    expect(validateReceipt(form, po, receiptLines(po)).deliveryNote).toBe(true);
  });

  it('sends the files with the payload', () => {
    const po = service();
    const bapp = file('bapp.pdf');
    const form = {
      ...emptyReceiptForm(po, '2026-11-05'),
      quantities: { a: 1 },
      deliveryNote: 'BAPP-001',
      files: [bapp],
    };

    expect(toReceiptInput(form, 'po1').attachments).toEqual([bapp]);
  });

  it('never asks goods for a number or a file', () => {
    const po = order([item('a', 4, 0)]);
    const form = { ...emptyReceiptForm(po, '2026-11-05'), quantities: { a: 1 } };
    const errors = validateReceipt(form, po, receiptLines(po));

    expect(errors.deliveryNote).toBe(false);
    expect(errors.files).toBe(false);
    expect(toReceiptInput(form, 'po1').attachments).toBeUndefined();
  });
});
