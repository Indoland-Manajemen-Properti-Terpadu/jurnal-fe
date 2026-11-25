import { toPaymentRequest } from './purchaseDocumentMappers';
import type { PaymentRequestDto } from './purchaseDto';

const bill = (id: string) => ({
  id,
  transactionNumber: `FKT/${id}`,
  vendorInvoiceNumber: 'INV',
  dueDate: '2026-11-28T00:00:00.000Z',
  finalAmount: 100,
  remainingAmount: 100,
  status: 'VERIFIED',
});

const dto = (overrides: Partial<PaymentRequestDto> = {}): PaymentRequestDto =>
  ({
    id: 'pp1',
    transactionNumber: 'PP/2026/11/0006',
    transactionDate: '2026-11-25T00:00:00.000Z',
    createdBy: 'u1',
    createdAt: '2026-11-25T00:00:00.000Z',
    kind: 'SETTLEMENT',
    status: 'APPROVED',
    amount: 300,
    vendor: { id: 'v1', displayName: 'PT Alfa' },
    ...overrides,
  }) as unknown as PaymentRequestDto;

describe('toPaymentRequest, vendors', () => {
  it('is a single-vendor request by default', () => {
    const doc = toPaymentRequest(dto());

    expect(doc.isMultiVendor).toBe(false);
    expect(doc.vendorTotals).toEqual([]);
  });

  it('reads what each vendor is asked for and the voucher each one got', () => {
    const doc = toPaymentRequest(
      dto({
        isMultiVendor: true,
        vendorTotals: [
          {
            vendor: 'v1',
            vendorName: 'PT Alfa',
            amount: 100,
            billCount: 1,
            voucher: { id: 'pv1', transactionNumber: 'PV/2026/11/0001', status: 'DRAFT' },
          },
          { vendor: 'v2', vendorName: 'CV Mitra', amount: 200, billCount: 2, voucher: null },
        ],
        itemRefs: [
          { amount: 100, bill: bill('b1'), vendor: 'v1', voucher: null },
          { amount: 200, bill: bill('b2'), vendor: 'v2', voucher: null },
        ],
      } as Partial<PaymentRequestDto>)
    );

    expect(doc.isMultiVendor).toBe(true);
    expect(doc.vendorTotals).toEqual([
      {
        vendorId: 'v1',
        vendorName: 'PT Alfa',
        amount: 100,
        billCount: 1,
        voucher: { id: 'pv1', number: 'PV/2026/11/0001', status: 'DRAFT' },
      },
      { vendorId: 'v2', vendorName: 'CV Mitra', amount: 200, billCount: 2, voucher: null },
    ]);
    expect(doc.items.map((item) => item.vendorId)).toEqual(['v1', 'v2']);
  });

  it('gives a bill line the vendor of the request when the service names none', () => {
    const doc = toPaymentRequest(
      dto({ itemRefs: [{ amount: 100, bill: bill('b1') }] } as Partial<PaymentRequestDto>)
    );

    expect(doc.items[0].vendorId).toBe('v1');
  });
});
