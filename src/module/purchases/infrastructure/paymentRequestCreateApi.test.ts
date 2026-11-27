import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPaymentRequestWithAttachments } from '@/module/purchases/infrastructure/paymentRequestCreateApi';

const { upload } = vi.hoisted(() => ({ upload: vi.fn() }));

vi.mock('@/module/purchases/infrastructure/purchaseHttp', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    upload,
    blob: vi.fn(),
  },
}));

describe('createPaymentRequestWithAttachments', () => {
  beforeEach(() => {
    upload.mockReset();
    upload.mockResolvedValue({
      data: {
        id: 'request-1',
        transactionNumber: 'PR/2026/11/0001',
        transactionDate: '2026-11-27',
        createdBy: 'user-1',
        createdAt: '2026-11-27T09:00:00.000Z',
        kind: 'DP',
        status: 'DRAFT',
        amount: 120000,
        purchaseOrderRef: {
          id: 'order-1',
          transactionNumber: 'PO/2026/11/0001',
        },
        attachments: [
          {
            fileName: 'proforma.pdf',
            filePath: 'uploads/proforma.pdf',
            mimeType: 'application/pdf',
          },
        ],
      },
    });
  });

  it('creates the DP draft and uploads its proforma in one multipart request', async () => {
    const file = new File(['proforma'], 'proforma.pdf', { type: 'application/pdf' });

    const request = await createPaymentRequestWithAttachments(
      {
        kind: 'DP',
        transactionDate: '2026-11-27',
        purchaseOrder: 'order-1',
        amount: 120000,
        advanceAccount: 'account-1',
        memo: 'DP furnitur',
      },
      [file]
    );

    expect(upload).toHaveBeenCalledTimes(1);
    const [url, body] = upload.mock.calls[0] as [string, FormData];
    expect(url).toBe('/v1/purchase-payment-requests');
    expect(body.get('kind')).toBe('DP');
    expect(body.get('transactionDate')).toBe('2026-11-27');
    expect(body.get('purchaseOrder')).toBe('order-1');
    expect(body.get('amount')).toBe('120000');
    expect(body.get('advanceAccount')).toBe('account-1');
    expect(body.get('memo')).toBe('DP furnitur');
    expect(body.getAll('attachments')).toHaveLength(1);
    expect((body.get('attachments') as File).name).toBe('proforma.pdf');
    expect(request).toMatchObject({
      id: 'request-1',
      number: 'PR/2026/11/0001',
      kind: 'DP',
      status: 'DRAFT',
      order: { id: 'order-1', number: 'PO/2026/11/0001' },
      attachments: [{ name: 'proforma.pdf' }],
    });
  });
});
