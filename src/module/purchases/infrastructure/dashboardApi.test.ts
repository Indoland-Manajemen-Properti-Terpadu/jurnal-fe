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

  it('reads the route and status of the procurement of a request, and none when it is null', async () => {
    get.mockResolvedValue({
      data: {
        purchaseRequests: [
          {
            id: 'pr1',
            transactionNumber: 'FPPBJ/1',
            status: 'IN_PROCUREMENT',
            procurement: {
              route: 'BIDDING',
              routeLabel: 'Bidding',
              status: 'DRAFT',
              statusLabel: 'Draf',
            },
          },
          { id: 'pr2', transactionNumber: 'FPPBJ/2', status: 'VERIFIED', procurement: null },
        ],
      },
    });
    const chain = await getDocumentChain('purchaseRequest', 'pr1');
    expect(chain.purchaseRequests[0].procurement).toEqual({
      routeLabel: 'Bidding',
      statusLabel: 'Draf',
    });
    expect(chain.purchaseRequests[1].procurement).toBeUndefined();
  });
});
