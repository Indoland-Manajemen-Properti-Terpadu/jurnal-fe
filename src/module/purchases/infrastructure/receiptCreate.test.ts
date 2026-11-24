import { createReceipt } from './purchaseApi';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const created = {
  data: {
    data: {
      id: 'gr1',
      transactionNumber: 'BAPP/2026/11/0001',
      transactionDate: '2026-11-24T00:00:00.000Z',
      createdBy: 'u1',
      createdAt: '2026-11-24T07:00:00.000Z',
      kind: 'SERVICE',
      status: 'PENDING_APPROVAL',
      vendor: { id: 'v1', displayName: 'PT Geruite' },
      purchaseOrder: 'po1',
      items: [],
    },
  },
};

describe('createReceipt', () => {
  beforeEach(() => http.post.mockReset());

  it('sends a goods receipt as plain JSON', async () => {
    http.post.mockResolvedValue(created);
    const input = {
      purchaseOrder: 'po1',
      transactionDate: '2026-11-24',
      items: [{ purchaseOrderItem: 'i1', receivedQty: 2 }],
    };

    await createReceipt(input);

    expect(http.post).toHaveBeenCalledWith('/v1/goods-receipts', input, expect.anything());
  });

  it('sends a service receipt with its signed files as multipart', async () => {
    http.post.mockResolvedValue(created);
    const bapp = new File(['x'], 'bapp.pdf', { type: 'application/pdf' });

    await createReceipt({
      purchaseOrder: 'po1',
      transactionDate: '2026-11-24',
      deliveryNote: 'BAPP-001',
      items: [{ purchaseOrderItem: 'i1', receivedQty: 1 }],
      attachments: [bapp],
    });

    const [url, form] = http.post.mock.calls[0];
    expect(url).toBe('/v1/goods-receipts');
    expect(form).toBeInstanceOf(FormData);
    const data = form as FormData;
    expect(data.get('purchaseOrder')).toBe('po1');
    expect(data.get('transactionDate')).toBe('2026-11-24');
    expect(data.get('deliveryNote')).toBe('BAPP-001');
    expect(JSON.parse(data.get('items') as string)).toEqual([
      { purchaseOrderItem: 'i1', receivedQty: 1 },
    ]);
    expect(data.getAll('attachments')).toHaveLength(1);
    expect((data.get('attachments') as File).name).toBe('bapp.pdf');
  });
});
