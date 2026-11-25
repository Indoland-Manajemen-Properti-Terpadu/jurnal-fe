import { toPurchaseOrder } from './purchaseDocumentMappers';
import type { PurchaseOrderDto } from './purchaseDto';

const dto = (overrides: Partial<PurchaseOrderDto> = {}): PurchaseOrderDto =>
  ({
    id: 'po1',
    transactionNumber: 'SPK/2026/11/0005',
    transactionDate: '2026-11-24T00:00:00.000Z',
    status: 'SENT',
    vendor: { id: 'v1', displayName: 'PT Geruite' },
    purchaseRequest: 'pr1',
    items: [],
    ...overrides,
  }) as unknown as PurchaseOrderDto;

describe('toPurchaseOrder, advance state', () => {
  it('has no advance state when the order has no advance', () => {
    expect(toPurchaseOrder(dto({ advanceState: null })).advanceState).toBeNull();
    expect(toPurchaseOrder(dto()).advanceState).toBeNull();
  });

  it('reads where the advance stands and which documents carry it', () => {
    const order = toPurchaseOrder(
      dto({
        advanceState: {
          mode: 'BILL',
          amount: 30000000,
          paidAmount: 30000000,
          billed: true,
          paid: true,
          postedAmount: 30000000,
          recognizedAmount: 7500000,
          heldAmount: 22500000,
          step: 'PAID',
          stepLabel: 'Lunas',
          canCreateBill: false,
          receiptAllowed: true,
          receiptBlockReason: null,
          bills: [{ id: 'b1', transactionNumber: 'FKT/2026/11/0012', status: 'VERIFIED' }],
          paymentRequests: [{ id: 'r1', transactionNumber: 'PR/2026/11/0001', status: 'APPROVED' }],
          paymentVouchers: [{ id: 'p1', transactionNumber: 'PV/2026/11/0001', status: 'PAID' }],
        },
      } as Partial<PurchaseOrderDto>)
    );

    expect(order.advanceState).toMatchObject({
      mode: 'BILL',
      amount: 30000000,
      heldAmount: 22500000,
      step: 'PAID',
      stepLabel: 'Lunas',
      receiptAllowed: true,
      receiptBlockReason: null,
      bills: [{ id: 'b1', number: 'FKT/2026/11/0012', status: 'VERIFIED' }],
      paymentRequests: [{ id: 'r1', number: 'PR/2026/11/0001', status: 'APPROVED' }],
      paymentVouchers: [{ id: 'p1', number: 'PV/2026/11/0001', status: 'PAID' }],
    });
  });

  it('keeps the reason a receipt is blocked, and fills in what the service leaves out', () => {
    const order = toPurchaseOrder(
      dto({
        advanceState: {
          mode: 'BILL',
          amount: 466200,
          step: 'CREATE_REQUEST',
          stepLabel: 'Ajukan payment request DP',
          canCreateBill: false,
          receiptAllowed: false,
          receiptBlockReason: 'FPB/BAPP baru bisa dicatat setelah faktur DP dibayar',
        },
      } as Partial<PurchaseOrderDto>)
    );

    expect(order.advanceState).toMatchObject({
      receiptAllowed: false,
      receiptBlockReason: 'FPB/BAPP baru bisa dicatat setelah faktur DP dibayar',
      paidAmount: 0,
      heldAmount: 0,
      bills: [],
      paymentRequests: [],
      paymentVouchers: [],
    });
  });
});
