import { createPaymentsByVendor } from './purchaseApi';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const voucher = (id: string, number: string) => ({
  id,
  transactionNumber: number,
  transactionDate: '2026-11-25T00:00:00.000Z',
  createdBy: 'u1',
  createdAt: '2026-11-25T00:00:00.000Z',
  status: 'DRAFT',
  vendor: { id: 'v1', displayName: 'PT Alfa' },
});

describe('createPaymentsByVendor', () => {
  beforeEach(() => {
    http.post.mockReset();
  });

  it('asks for one voucher per vendor and reads every voucher it gets back', async () => {
    http.post.mockResolvedValue({
      data: { data: { payments: [voucher('p1', 'PV/1'), voucher('p2', 'PV/2')] } },
    });

    const made = await createPaymentsByVendor({
      transactionDate: '2026-11-25',
      paymentRequests: ['pp1'],
    });

    expect(http.post.mock.calls[0][0]).toBe('/v1/purchase-payments/by-vendor');
    expect(http.post.mock.calls[0][1]).toEqual({
      transactionDate: '2026-11-25',
      paymentRequests: ['pp1'],
    });
    expect(made.map((doc) => doc.number)).toEqual(['PV/1', 'PV/2']);
  });

  it('gives an empty list when the service answers with no vouchers', async () => {
    http.post.mockResolvedValue({ data: { data: {} } });

    expect(
      await createPaymentsByVendor({ transactionDate: '2026-11-25', paymentRequests: ['pp1'] })
    ).toEqual([]);
  });
});
