import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import {
  addDays,
  billableLines,
  clampBilled,
  defaultBillForm,
  detectVariances,
  dueDateFor,
  estimateBill,
  hasBillErrors,
  isCustomized,
  toBillInput,
  toBillUpdateInput,
  validateBill,
} from '@/module/purchases/domain/billForm';

const tax = { id: 't11', name: 'PPN 11%', rate: 11 };

const order = (overrides: Partial<PurchaseOrder> = {}): PurchaseOrder =>
  ({
    id: 'po1',
    subtotal: 40000,
    discountType: null,
    discountValue: 0,
    withholdingType: null,
    withholdingValue: 0,
    isPriceIncludeTax: false,
    items: [
      {
        id: 'i1',
        product: null,
        description: 'Layanan A',
        quantity: 4,
        unitName: null,
        unitPrice: 10000,
        tax,
        receivedQty: 3,
        billedQty: 1,
      },
      {
        id: 'i2',
        product: null,
        description: 'Layanan B',
        quantity: 2,
        unitName: null,
        unitPrice: 5000,
        tax: null,
        receivedQty: 0,
        billedQty: 0,
      },
    ],
    ...overrides,
  }) as unknown as PurchaseOrder;

describe('billForm', () => {
  it('bills only what was received and not yet billed', () => {
    const lines = billableLines(order());
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ itemId: 'i1', maxQty: 2, poUnitPrice: 10000, poTaxId: 't11' });
  });

  it('adds back the quantity a draft bill already holds when editing it', () => {
    const lines = billableLines(order(), { i1: 1 });
    expect(lines[0].maxQty).toBe(3);
  });

  it('computes due dates without time-zone drift', () => {
    expect(addDays('2026-11-05', 30)).toBe('2026-12-05');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(dueDateFor('2026-11-05', null)).toBe('');
    expect(dueDateFor('', 30)).toBe('');
  });

  it('is not customized by default and sends no items', () => {
    const lines = billableLines(order());
    const form = defaultBillForm(order(), lines, '2026-11-05', 30, '');
    expect(form.dueDate).toBe('2026-12-05');
    expect(isCustomized(form, lines)).toBe(false);
    expect(toBillInput(form, lines, 'po1')).toEqual({
      purchaseOrder: 'po1',
      transactionDate: '2026-11-05',
      dueDate: '2026-12-05',
    });
  });

  it('sends the items once a quantity, price or tax is changed', () => {
    const lines = billableLines(order());
    const form = defaultBillForm(order(), lines, '2026-11-05', null, '');
    form.lines.i1 = { quantity: 1, unitPrice: 11000, taxId: '' };
    expect(isCustomized(form, lines)).toBe(true);
    expect(toBillInput(form, lines, 'po1').items).toEqual([
      { purchaseOrderItem: 'i1', quantity: 1, unitPrice: 11000 },
    ]);
  });

  it('clamps a quantity to what can still be billed', () => {
    expect(clampBilled(9, 2)).toBe(2);
    expect(clampBilled(-3, 2)).toBe(0);
  });

  it('estimates the bill from the billed part of the order', () => {
    const lines = billableLines(order());
    const form = defaultBillForm(order(), lines, '2026-11-05', null, '');
    const totals = estimateBill(order(), lines, form, [tax]);
    expect(totals).toMatchObject({ subtotal: 20000, taxAmount: 2200, finalAmount: 22200 });
  });

  it('shares a fixed discount in proportion to the part that is billed', () => {
    const po = order({ discountType: 'nominal', discountValue: 4000 });
    const lines = billableLines(po);
    const form = defaultBillForm(po, lines, '2026-11-05', null, '');
    // half of the order subtotal is billed, so half of the fixed discount applies
    expect(estimateBill(po, lines, form, [tax]).discountAmount).toBe(2000);
  });

  it('flags a price change and an invoice total off by more than Rp1', () => {
    const lines = billableLines(order());
    const form = {
      ...defaultBillForm(order(), lines, '2026-11-05', null, ''),
      vendorInvoiceTotal: 11100,
    };
    form.lines.i1 = { quantity: 1, unitPrice: 11000, taxId: 't11' };
    const estimate = estimateBill(order(), lines, form, [tax]);
    const notices = detectVariances(form, lines, estimate);
    expect(notices.map((notice) => notice.type)).toEqual(['PRICE', 'TOTAL']);
    expect(notices[0]).toMatchObject({ itemName: 'Layanan A', expected: 10000, actual: 11000 });

    const within = { ...form, vendorInvoiceTotal: estimate.finalAmount + 1 };
    expect(detectVariances(within, lines, estimate).some((n) => n.type === 'TOTAL')).toBe(false);
  });

  it('validates date, due date, quantity and invoice total', () => {
    const lines = billableLines(order());
    const form = defaultBillForm(order(), lines, '2026-11-05', null, '');
    expect(hasBillErrors(validateBill(form, lines))).toBe(false);
    expect(validateBill({ ...form, date: '' }, lines).date).toBe('required');
    expect(validateBill({ ...form, dueDate: '2026-11-01' }, lines).dueDate).toBe('beforeDate');
    expect(validateBill({ ...form, vendorInvoiceTotal: -1 }, lines).invalidInvoiceTotal).toBe(true);
    form.lines.i1 = { quantity: 0, unitPrice: 10000, taxId: 't11' };
    expect(validateBill(form, lines).noQuantity).toBe(true);
    form.lines.i1 = { quantity: 5, unitPrice: 10000, taxId: 't11' };
    expect(validateBill(form, lines).invalidLineIds).toEqual(['i1']);
  });

  it('builds the update payload with explicit nulls and without the order', () => {
    const lines = billableLines(order());
    const form = defaultBillForm(order(), lines, '2026-11-05', null, '');
    expect(toBillUpdateInput(form, lines)).toEqual({
      transactionDate: '2026-11-05',
      vendorInvoiceNumber: '',
      vendorInvoiceTotal: null,
      paymentTerm: null,
      memo: '',
      items: [{ purchaseOrderItem: 'i1', quantity: 2, unitPrice: 10000, tax: 't11' }],
    });
  });
});
