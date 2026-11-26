import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDashboardActions,
  getDocumentChain,
} from '@/module/purchases/infrastructure/dashboardApi';

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

describe('getDashboardActions', () => {
  beforeEach(() => get.mockReset());

  it('preserves service order, severity counts, and the oldest action', async () => {
    const first = {
      key: 'f-1',
      title: 'Catat faktur',
      severity: 'stale',
      late: 12,
      target: { type: 'goodsReceipt', id: 'r1' },
    };
    const second = {
      key: 'b-2',
      title: 'Ajukan pembayaran',
      severity: 'ok',
      target: { type: 'purchaseBill', id: 'b2' },
    };
    get.mockResolvedValue({
      data: {
        total: 2,
        late: 1,
        bySeverity: { stale: 1, warn: 0, ok: 1 },
        oldest: first,
        items: [first, second],
      },
    });

    const actions = await getDashboardActions();
    expect(actions.bySeverity).toEqual({ stale: 1, warn: 0, ok: 1 });
    expect(actions.oldest).toMatchObject({ key: 'f-1', severity: 'stale', late: 12 });
    expect(actions.items.map((item) => item.key)).toEqual(['f-1', 'b-2']);
    expect(actions.items[1]).toMatchObject({ subtitle: '', due: null, severity: 'ok' });
  });
});
