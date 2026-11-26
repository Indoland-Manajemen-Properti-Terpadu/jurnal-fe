import { toPurchaseOrder } from '@/module/purchases/infrastructure/purchaseDocumentMappers';
import type { PurchaseOrderDto } from '@/module/purchases/infrastructure/purchaseDto';

const source = {
  id: 'order-2',
  transactionNumber: 'PO/2026/11/0002',
  transactionDate: '2026-11-26T00:00:00.000Z',
  status: 'PENDING_APPROVAL',
  vendor: { id: 'vendor-1', displayName: 'PT Contoh' },
  purchaseRequest: 'request-1',
  items: [],
} as unknown as PurchaseOrderDto;

describe('reordered order detail', () => {
  it('keeps source links, pending roles and a zero-based decision stage', () => {
    const order = toPurchaseOrder({
      ...source,
      canReorder: false,
      reorderSourceRef: { id: 'order-1', transactionNumber: 'PO/2026/10/0001' },
      reorder: {
        note: 'Harga vendor berubah',
        sourceTotal: 100000,
        priceIncreased: true,
        totalIncreased: false,
      },
      canDecide: true,
      pendingApprovers: [
        {
          level: 0,
          name: 'Finance',
          mode: 'ALL',
          roles: [{ id: 'role-1', name: 'Finance', approved: false }],
        },
      ],
    });

    expect(order.reorderSourceRef).toEqual({ id: 'order-1', number: 'PO/2026/10/0001' });
    expect(order.reorder).toMatchObject({
      sourceTotal: 100000,
      priceIncreased: true,
      totalIncreased: false,
    });
    expect(order.canDecide).toBe(true);
    expect(order.approvalStage).toBe(0);
    expect(order.pendingApprovers[0].roles[0].approved).toBe(false);
  });
});
