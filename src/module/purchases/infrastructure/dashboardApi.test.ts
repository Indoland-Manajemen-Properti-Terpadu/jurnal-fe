import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDocumentChain } from '@/module/purchases/infrastructure/dashboardApi';

const get = vi.fn();
vi.mock('@/module/purchases/infrastructure/purchaseHttp', () => ({
  http: { get: (...args: unknown[]) => get(...args) },
}));

describe('getDocumentChain', () => {
  beforeEach(() => get.mockReset());

  it('reads the service number and kind of each linked document, and tolerates a missing group', async () => {
    get.mockResolvedValue({
      data: {
        purchaseOrders: [{ id: 'po1', transactionNumber: 'PO/1', status: 'SENT' }],
        paymentRequests: [{ id: 'pp1', transactionNumber: 'PP/1', status: 'APPROVED', kind: 'DP' }],
      },
    });
    const chain = await getDocumentChain('purchaseOrder', 'po1');
    expect(chain.purchaseOrders).toEqual([{ id: 'po1', number: 'PO/1', status: 'SENT' }]);
    expect(chain.paymentRequests[0]).toMatchObject({ number: 'PP/1', kind: 'DP' });
    expect(chain.purchaseReturns).toEqual([]);
    expect(get).toHaveBeenCalledWith('/v1/purchase-dashboard/chain', {
      type: 'purchaseOrder',
      id: 'po1',
    });
  });
});
