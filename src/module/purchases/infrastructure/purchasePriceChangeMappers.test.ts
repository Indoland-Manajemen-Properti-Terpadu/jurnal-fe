import { toPriceChangeRequest } from '@/module/purchases/infrastructure/purchasePriceChangeMappers';

describe('price change response mapping', () => {
  it('maps PO references, changed prices, and the active approval stage', () => {
    expect(
      toPriceChangeRequest({
        id: 'change-1',
        status: 'PENDING_APPROVAL',
        purchaseOrder: { id: 'order-1', transactionNumber: 'PO/2026/11/0001' },
        reason: 'Invoice vendor berubah',
        vendorInvoiceNumber: 'INV-01',
        vendorInvoiceTotal: 1_250,
        items: [
          {
            purchaseOrderItem: { id: 'line-1', description: 'Meja rapat' },
            description: 'Meja rapat',
            oldUnitPrice: 1_000,
            newUnitPrice: 1_250,
          },
        ],
        approvalPlan: [
          {
            name: 'Chief Finance',
            mode: 'ALL',
            roles: [{ role: 'CHIEF_FINANCE', name: 'Chief Finance' }],
          },
          {
            name: 'Building Manager',
            mode: 'ANY',
            roles: [{ role: 'BUILDING_MANAGER', name: 'Building Manager' }],
          },
        ],
        approvals: [],
        pendingApprovers: [
          {
            level: 0,
            name: 'Chief Finance',
            mode: 'ALL',
            roles: [{ id: 'CHIEF_FINANCE', name: 'Chief Finance', approved: false }],
          },
        ],
        approvalStage: 0,
        canDecide: true,
      })
    ).toMatchObject({
      id: 'change-1',
      status: 'PENDING_APPROVAL',
      purchaseOrderId: 'order-1',
      purchaseOrderNumber: 'PO/2026/11/0001',
      vendorInvoiceTotal: 1_250,
      items: [
        {
          purchaseOrderItemId: 'line-1',
          description: 'Meja rapat',
          oldUnitPrice: 1_000,
          newUnitPrice: 1_250,
        },
      ],
      approvalStage: 0,
      canDecide: true,
      plan: [
        {
          name: 'Chief Finance',
          mode: 'ALL',
          roles: [{ id: 'CHIEF_FINANCE', name: 'Chief Finance' }],
        },
        {
          name: 'Building Manager',
          mode: 'ANY',
          roles: [{ id: 'BUILDING_MANAGER', name: 'Building Manager' }],
        },
      ],
      pending: [{ level: 0, name: 'Chief Finance', mode: 'ALL' }],
    });
  });

  it('maps a missing pending request to null on order detail', () => {
    expect(toPriceChangeRequest(null)).toBeNull();
  });
});
