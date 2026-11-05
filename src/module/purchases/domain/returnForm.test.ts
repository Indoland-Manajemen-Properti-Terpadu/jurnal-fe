import {
  clampReturnQty,
  emptyReturnForm,
  hasReturnErrors,
  previewReturn,
  returnLines,
  splitReturn,
  toReturnInput,
  toReturnUpdateInput,
  validateReturn,
} from '@/module/purchases/domain/returnForm';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';

/** The worked example of the backend doc: 10 x 50.000, 5% discount, 11% tax, 2% withholding. */
const exampleBill = {
  id: 'bill1',
  date: '2026-11-01',
  status: 'PAID',
  subtotal: 500000,
  discountAmount: 25000,
  withholdingAmount: 9500,
  items: [
    {
      id: 'i1',
      description: 'Jasa',
      product: null,
      quantity: 10,
      returnedQty: 0,
      unitName: null,
      amount: 500000,
      discountAmount: 25000,
      taxAmount: 52250,
    },
  ],
} as unknown as PurchaseBill;

describe('previewReturn', () => {
  it('matches the backend example for 2 of 10 units (103.550)', () => {
    expect(previewReturn(exampleBill, { i1: 2 })).toEqual({
      amount: 100000,
      discountAmount: 5000,
      net: 95000,
      taxAmount: 10450,
      withholdingAmount: 1900,
      finalAmount: 103550,
    });
  });

  it('is zero when nothing is returned', () => {
    expect(previewReturn(exampleBill, {}).finalAmount).toBe(0);
  });

  it('never returns more than what is still returnable', () => {
    const bill = {
      ...exampleBill,
      items: [{ ...exampleBill.items[0], returnedQty: 8 }],
    } as PurchaseBill;
    const preview = previewReturn(bill, { i1: 5 });
    expect(preview.amount).toBe(100000);
  });

  it('adds a return in steps up to the whole bill without a cent of drift', () => {
    const steps = [3, 3, 4];
    let done = 0;
    let total = 0;
    steps.forEach((qty) => {
      const bill = {
        ...exampleBill,
        items: [{ ...exampleBill.items[0], returnedQty: done }],
      } as PurchaseBill;
      total += previewReturn(bill, { i1: qty }).finalAmount;
      done += qty;
    });
    expect(total).toBe(517750);
  });
});

describe('splitReturn', () => {
  it('reduces an open bill first and turns the rest into credit', () => {
    expect(splitReturn(51775, 10000)).toEqual({ appliedToBill: 10000, credit: 41775 });
  });

  it('turns the whole value into credit for a settled bill', () => {
    expect(splitReturn(51775, 0)).toEqual({ appliedToBill: 0, credit: 51775 });
  });
});

describe('return lines and validation', () => {
  it('derives what can still go back', () => {
    const bill = {
      ...exampleBill,
      items: [{ ...exampleBill.items[0], returnedQty: 4 }],
    } as PurchaseBill;
    expect(returnLines(bill)[0].returnable).toBe(6);
  });

  it('needs a quantity, a reason of three characters and a date from the bill date on', () => {
    const lines = returnLines(exampleBill);
    const errors = validateReturn(
      { ...emptyReturnForm('2026-10-01'), reason: 'ab' },
      exampleBill,
      lines
    );
    expect(errors).toMatchObject({ date: 'beforeBill', reason: true, noQuantity: true });
    expect(hasReturnErrors(errors)).toBe(true);
  });

  it('flags a quantity above what is returnable', () => {
    const lines = returnLines(exampleBill);
    const errors = validateReturn(
      { ...emptyReturnForm('2026-11-05'), reason: 'Rusak', quantities: { i1: 11 } },
      exampleBill,
      lines
    );
    expect(errors.overIds).toEqual(['i1']);
  });

  it('clamps a typed quantity', () => {
    expect(clampReturnQty(20, 10)).toBe(10);
    expect(clampReturnQty(-1, 10)).toBe(0);
  });
});

describe('return payloads', () => {
  const values = {
    date: '2026-11-05',
    reason: ' Barang rusak ',
    memo: '',
    quantities: { i1: 2, i2: 0 },
  };

  it('creates with the bill and only the lines that go back', () => {
    expect(toReturnInput(values, 'bill1')).toEqual({
      bill: 'bill1',
      transactionDate: '2026-11-05',
      reason: 'Barang rusak',
      memo: undefined,
      items: [{ billItem: 'i1', quantity: 2 }],
    });
  });

  it('leaves the bill out of an update', () => {
    expect(toReturnUpdateInput(values)).not.toHaveProperty('bill');
  });
});
