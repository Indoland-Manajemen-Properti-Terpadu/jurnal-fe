import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import type { BillSourceDoc } from '@/module/purchases/domain/billSources';
import {
  billToForm,
  emptyBillForm,
  emptyManualLine,
  hasBillErrors,
  toBillInput,
  toBillPreviewInput,
  toBillUpdate,
  validateBillForm,
} from '@/module/purchases/domain/billForm';

const doc = (id: string): BillSourceDoc =>
  ({ id, vendor: { id: 'v1' }, termKey: 'k' }) as unknown as BillSourceDoc;

const valid = () => ({ ...emptyBillForm('2026-11-22') });

describe('validateBillForm', () => {
  it('accepts a bill from receipts with only the date', () => {
    expect(hasBillErrors(validateBillForm(valid(), 'RECEIPT'))).toBe(false);
  });

  it('requires the bill date and keeps the due date on or after it', () => {
    const options = { headerOnly: true };
    expect(validateBillForm({ ...valid(), date: '' }, 'MANUAL', options).fields.date).toBe(
      'dateRequired'
    );
    expect(
      validateBillForm({ ...valid(), dueDate: '2026-11-01' }, 'MANUAL', options).fields.dueDate
    ).toBe('dueBeforeDate');
    expect(
      validateBillForm({ ...valid(), dueDate: '2026-11-22' }, 'MANUAL', options).fields
    ).toEqual({});
  });

  it('refuses what the service accepts: a percent above 100 and a negative amount', () => {
    const form = {
      ...valid(),
      discountKind: 'percentage' as const,
      discountValue: 150,
      withholdingKind: 'percentage' as const,
      withholdingValue: 120,
      vendorInvoiceTotal: -1,
    };
    expect(validateBillForm(form, 'MANUAL', { headerOnly: true }).fields).toMatchObject({
      discountValue: 'discountPercent',
      withholdingValue: 'withholdingPercent',
      vendorInvoiceTotal: 'invoiceTotalNegative',
    });
  });

  it('refuses a nominal discount above the subtotal once the subtotal is known', () => {
    const form = { ...valid(), discountKind: 'nominal' as const, discountValue: 1_000_001 };
    expect(
      validateBillForm(form, 'MANUAL', { headerOnly: true }).fields.discountValue
    ).toBeUndefined();
    expect(
      validateBillForm(form, 'MANUAL', { subtotal: 1_000_000, headerOnly: true }).fields
        .discountValue
    ).toBe('discountTooHigh');
    expect(
      validateBillForm({ ...form, discountValue: 1_000_000 }, 'MANUAL', {
        subtotal: 1_000_000,
        headerOnly: true,
      }).fields
    ).toEqual({});
  });

  it('does not validate hidden due-date and discount overrides on PO/SPK bills', () => {
    const form = {
      ...valid(),
      dueDate: '2026-11-21',
      discountKind: 'percentage' as const,
      discountValue: 150,
    };
    expect(validateBillForm(form, 'ORDER').fields).not.toHaveProperty('dueDate');
    expect(validateBillForm(form, 'ORDER').fields).not.toHaveProperty('discountValue');
  });

  it('checks a manual bill: a vendor, a product or account per line, a quantity and a price above 0', () => {
    const errors = validateBillForm(valid(), 'MANUAL');
    const [line] = valid().lines;
    expect(errors.fields.vendorId).toBe('vendorRequired');
    expect(Object.values(errors.lines)[0]).toEqual({
      target: 'targetRequired',
      unitPrice: 'pricePositive',
    });
    const fixed = {
      ...valid(),
      vendorId: 'v1',
      lines: [{ ...emptyManualLine(), accountId: 'a1', unitPrice: 1800000 }],
    };
    expect(hasBillErrors(validateBillForm(fixed, 'MANUAL'))).toBe(false);
    expect(
      validateBillForm({ ...fixed, lines: [{ ...fixed.lines[0], unitPrice: 0 }] }, 'MANUAL').lines[
        fixed.lines[0].key
      ]
    ).toEqual({ unitPrice: 'pricePositive' });
    expect(line.quantity).toBe(1);
  });

  it('does not ask a saved manual draft for lines, which are not on its edit form', () => {
    const edited = { ...valid(), vendorId: 'v1', lines: [] };
    expect(hasBillErrors(validateBillForm(edited, 'MANUAL', { headerOnly: true }))).toBe(false);
  });

  it('needs at least one manual line', () => {
    expect(validateBillForm({ ...valid(), vendorId: 'v1', lines: [] }, 'MANUAL').fields.lines).toBe(
      'linesEmpty'
    );
  });
});

describe('toBillInput', () => {
  it('names the receipts picked and sends only the header fields that were filled', () => {
    const form = {
      ...valid(),
      vendorInvoiceNumber: ' INV-1 ',
      vendorInvoiceTotal: 1733200,
      discountKind: 'nominal' as const,
      discountValue: 50000,
      withholdingKind: 'percentage' as const,
      withholdingValue: 2,
      withholdingTaxCode: ' PPh23 ',
      tagIds: ['t1'],
      memo: ' catatan ',
    };

    expect(toBillInput('RECEIPT', form, [doc('r1'), doc('r2')], true)).toEqual({
      source: 'RECEIPT',
      goodsReceipts: ['r1', 'r2'],
      transactionDate: '2026-11-22',
      vendorInvoiceNumber: 'INV-1',
      withholdingType: 'percentage',
      withholdingValue: 2,
      withholdingTaxCode: 'PPh23',
      tags: ['t1'],
      memo: 'catatan',
      post: true,
    });
  });

  it('bills the orders of an ORDER source, as a draft by default', () => {
    expect(toBillInput('ORDER', valid(), [doc('o1')], false)).toEqual({
      source: 'ORDER',
      purchaseOrders: ['o1'],
      transactionDate: '2026-11-22',
    });
  });

  it('sends a vendor total only to the PO preview, never to the saved PO bill', () => {
    const form = { ...valid(), vendorInvoiceTotal: 1733200 };
    expect(toBillInput('ORDER', form, [doc('o1')], false)).not.toHaveProperty('vendorInvoiceTotal');
    expect(toBillPreviewInput('ORDER', form, [doc('o1')], false)).toMatchObject({
      source: 'ORDER',
      vendorInvoiceTotal: 1733200,
    });
    expect(toBillInput('MANUAL', { ...form, vendorId: 'v1' }, [], false)).toHaveProperty(
      'vendorInvoiceTotal',
      1733200
    );
  });

  it('sends a manual bill with its vendor and lines, an account only when no product is chosen', () => {
    const form = {
      ...valid(),
      vendorId: 'v1',
      lines: [
        {
          ...emptyManualLine(),
          accountId: 'a1',
          description: ' Listrik ',
          quantity: 1,
          unitPrice: 1800000,
        },
        {
          ...emptyManualLine(),
          productId: 'p1',
          accountId: 'a2',
          quantity: 2,
          unitPrice: 5,
          taxId: 'tax',
        },
      ],
    };
    expect(toBillInput('MANUAL', form, [], false)).toMatchObject({
      source: 'MANUAL',
      vendor: 'v1',
      items: [
        { account: 'a1', description: 'Listrik', quantity: 1, unitPrice: 1800000 },
        { product: 'p1', description: '', quantity: 2, unitPrice: 5, tax: 'tax' },
      ],
    });
    const second = (toBillInput('MANUAL', form, [], false) as { items: object[] }).items[1];
    expect(second).not.toHaveProperty('account');
  });
});

describe('toBillUpdate and billToForm', () => {
  const bill = {
    date: '2026-11-22',
    vendorInvoiceNumber: 'INV-1',
    taxInvoiceNumber: '010',
    vendorInvoiceTotal: 100,
    dueDate: '2026-12-22',
    discountType: 'percentage',
    discountValue: 10,
    withholdingType: null,
    withholdingValue: 0,
    withholdingTaxCode: null,
    tags: ['t1'],
    memo: 'm',
    vendor: { id: 'v1', name: 'PT A' },
  } as unknown as PurchaseBill;

  it('opens a draft with its header', () => {
    expect(billToForm(bill)).toMatchObject({
      date: '2026-11-22',
      vendorInvoiceNumber: 'INV-1',
      discountKind: 'percentage',
      discountValue: 10,
      withholdingKind: 'none',
      tagIds: ['t1'],
    });
  });

  it('sends cleared fields as empty or null so a PUT replaces them', () => {
    const cleared = {
      ...billToForm(bill),
      vendorInvoiceNumber: '',
      discountKind: 'none' as const,
      memo: '',
      tagIds: [],
    };
    expect(toBillUpdate(cleared)).toMatchObject({
      vendorInvoiceNumber: '',
      discountType: null,
      discountValue: 0,
      withholdingType: null,
      memo: '',
      tags: [],
    });
  });
});
