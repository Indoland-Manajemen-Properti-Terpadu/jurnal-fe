import { cancelOrderAdvance } from '@/module/purchases/infrastructure/purchaseAdvanceApi';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@/module/purchases/infrastructure/purchaseHttp', () => ({
  http: { post },
}));

describe('cancelOrderAdvance', () => {
  it('posts the required reason to the order advance cancellation route', async () => {
    const result = {
      purchaseOrder: 'po1',
      paymentRequest: { _id: 'request1', status: 'CANCELLED', cancelReason: 'Duplicate request' },
      paymentVoucher: { _id: 'voucher1', status: 'VOID' },
    };
    post.mockResolvedValue({ data: result });

    await expect(cancelOrderAdvance('po1', 'request1', 'Duplicate request')).resolves.toEqual(
      result
    );
    expect(post).toHaveBeenCalledWith('/v1/purchase-orders/po1/advances/request1/cancel', {
      reason: 'Duplicate request',
    });
  });
});
