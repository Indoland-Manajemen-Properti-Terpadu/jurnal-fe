import { billVerifyMissing } from './billVerify';
import type { PurchaseBill } from './purchaseDocuments';

const file = (kind: 'VENDOR_INVOICE' | 'TAX_INVOICE' | 'OTHER') => ({
  id: kind,
  name: `${kind}.pdf`,
  url: '',
  mimeType: 'application/pdf',
  kind,
  kindLabel: '',
});

const bill = (overrides: Partial<PurchaseBill> = {}): PurchaseBill =>
  ({
    source: 'RECEIPT',
    vendorInvoiceNumber: 'INV-1',
    vendorInvoiceTotal: 1000,
    taxAmount: 0,
    attachments: [file('VENDOR_INVOICE')],
    ...overrides,
  }) as PurchaseBill;

describe('billVerifyMissing', () => {
  it('finds nothing missing on a complete bill without VAT', () => {
    expect(billVerifyMissing(bill())).toEqual([]);
  });

  it('asks for the vendor invoice number, ignoring spaces', () => {
    expect(billVerifyMissing(bill({ vendorInvoiceNumber: '   ' }))).toEqual([
      'vendorInvoiceNumber',
    ]);
  });

  it('asks for the vendor invoice file', () => {
    expect(billVerifyMissing(bill({ attachments: [file('OTHER'), file('TAX_INVOICE')] }))).toEqual([
      'vendorInvoiceFile',
    ]);
  });

  it('asks for the vendor invoice total only on a bill from a receipt', () => {
    expect(billVerifyMissing(bill({ vendorInvoiceTotal: null }))).toEqual(['vendorInvoiceTotal']);
    expect(billVerifyMissing(bill({ source: 'ORDER', vendorInvoiceTotal: null }))).toEqual([]);
    expect(billVerifyMissing(bill({ source: 'MANUAL', vendorInvoiceTotal: null }))).toEqual([]);
  });

  it('accepts a vendor invoice total of zero as filled in', () => {
    expect(billVerifyMissing(bill({ vendorInvoiceTotal: 0 }))).toEqual([]);
  });

  it('asks for the tax invoice file only when the bill carries VAT', () => {
    expect(billVerifyMissing(bill({ taxAmount: 110 }))).toEqual(['taxInvoiceFile']);
    expect(
      billVerifyMissing(
        bill({ taxAmount: 110, attachments: [file('VENDOR_INVOICE'), file('TAX_INVOICE')] })
      )
    ).toEqual([]);
  });

  it('lists every gap in the order of the form', () => {
    expect(
      billVerifyMissing(
        bill({ vendorInvoiceNumber: '', vendorInvoiceTotal: null, taxAmount: 5, attachments: [] })
      )
    ).toEqual(['vendorInvoiceNumber', 'vendorInvoiceFile', 'vendorInvoiceTotal', 'taxInvoiceFile']);
  });
});
