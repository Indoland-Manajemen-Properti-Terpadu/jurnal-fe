import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  approvePriceChange,
  createPriceChange,
  listPriceChanges,
  rejectPriceChange,
} from '@/module/purchases/infrastructure/purchasePriceChangeApi';

const get = vi.fn();
const post = vi.fn();
vi.mock('@/module/purchases/infrastructure/purchaseHttp', () => ({
  http: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));

describe('price change API', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('loads the pending approval queue with the requested order filters', async () => {
    get.mockResolvedValue({
      data: {
        results: [
          {
            id: 'change-1',
            status: 'PENDING_APPROVAL',
            purchaseOrderRef: { id: 'order-1', transactionNumber: 'PO/01' },
            items: [],
          },
        ],
        page: 1,
        limit: 100,
        totalPages: 1,
        totalResults: 1,
      },
    });
    const page = await listPriceChanges({ status: 'PENDING_APPROVAL', page: 1, limit: 100 });
    expect(get).toHaveBeenCalledWith('/v1/purchase-orders/price-changes', {
      status: 'PENDING_APPROVAL',
      page: 1,
      limit: 100,
    });
    expect(page.items[0]).toMatchObject({
      purchaseOrderId: 'order-1',
      purchaseOrderNumber: 'PO/01',
    });
  });

  it('creates a price change on the selected PO with the invoice context', async () => {
    post.mockResolvedValue({
      data: { id: 'change-1', status: 'PENDING_APPROVAL', purchaseOrder: 'order-1', items: [] },
    });
    const input = {
      items: [{ purchaseOrderItem: 'line-1', newUnitPrice: 1_250 }],
      reason: 'Harga invoice vendor berbeda',
      vendorInvoiceNumber: 'INV-01',
      vendorInvoiceTotal: 2_500,
    };
    await createPriceChange('order-1', input);
    expect(post).toHaveBeenCalledWith('/v1/purchase-orders/order-1/price-changes', input);
  });

  it('approves a tax-bearing price change with one mocked write', async () => {
    const invoiceTotal = 1_250_000;
    post.mockResolvedValue({
      data: {
        id: 'change-tax',
        status: 'APPROVED',
        purchaseOrder: { id: 'order-1', transactionNumber: 'PO/2026/11/0011' },
        vendorInvoiceNumber: 'INV-TAX-001',
        vendorInvoiceTotal: invoiceTotal,
        items: [
          {
            purchaseOrderItem: { id: 'line-1', description: 'Meja rapat' },
            previousUnitPrice: 55_000,
            newUnitPrice: 60_000,
          },
        ],
        approvalStage: 1,
      },
    });

    const approved = await approvePriceChange('change-tax', 1, 'Tax invoice reviewed');

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/v1/purchase-orders/price-changes/change-tax/approve', {
      approvalStage: 1,
      note: 'Tax invoice reviewed',
    });
    expect(approved).toMatchObject({
      status: 'APPROVED',
      vendorInvoiceTotal: invoiceTotal,
      items: [{ oldUnitPrice: 55_000, newUnitPrice: 60_000 }],
    });
  });

  it('sends the active stage for approval and a reason for rejection', async () => {
    post.mockResolvedValue({ data: { id: 'change-1', status: 'PENDING_APPROVAL', items: [] } });
    await approvePriceChange('change-1', 1, 'Setuju');
    expect(post).toHaveBeenLastCalledWith('/v1/purchase-orders/price-changes/change-1/approve', {
      approvalStage: 1,
      note: 'Setuju',
    });
    await rejectPriceChange('change-1', 1, 'Harga belum disepakati');
    expect(post).toHaveBeenLastCalledWith('/v1/purchase-orders/price-changes/change-1/reject', {
      approvalStage: 1,
      reason: 'Harga belum disepakati',
    });
  });
});
