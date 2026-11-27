import { payVoucher } from './purchaseApi';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const paidVoucher = {
  id: 'pv1',
  transactionNumber: 'PV/2026/11/0001',
  transactionDate: '2026-11-25T00:00:00.000Z',
  createdBy: 'u1',
  createdAt: '2026-11-25T00:00:00.000Z',
  status: 'PAID',
  vendor: { id: 'v1', displayName: 'Vendor' },
  totalAmount: 100,
};

describe('payVoucher', () => {
  beforeEach(() => http.post.mockReset());

  it('uploads proof before asking the server to pay the voucher', async () => {
    http.post.mockResolvedValue({ data: { data: paidVoucher } });
    const proof = new File(['proof'], 'transfer.pdf', { type: 'application/pdf' });
    const input = {
      paidAt: '2026-11-25',
      depositAccount: 'acc1',
      referenceNumber: 'TRF-001',
    };

    await payVoucher('pv1', input, [proof]);

    expect(http.post).toHaveBeenCalledTimes(2);
    expect(http.post.mock.calls[0][0]).toBe('/v1/purchase-payments/pv1/attachments');
    expect((http.post.mock.calls[0][1] as FormData).getAll('attachments')).toEqual([proof]);
    expect(http.post.mock.calls[1][0]).toBe('/v1/purchase-payments/pv1/pay');
    expect(http.post.mock.calls[1][1]).toEqual(input);
  });

  it('does not pay when uploading proof fails', async () => {
    http.post.mockImplementation((url: string | undefined) =>
      url?.endsWith('/attachments')
        ? Promise.reject(new Error('upload failed'))
        : Promise.resolve({ data: { data: paidVoucher } })
    );
    const proof = new File(['proof'], 'transfer.pdf', { type: 'application/pdf' });

    await expect(
      payVoucher(
        'pv1',
        { paidAt: '2026-11-25', depositAccount: 'acc1', referenceNumber: 'TRF-001' },
        [proof]
      )
    ).rejects.toThrow();
    expect(http.post).toHaveBeenCalledTimes(1);
  });
});
