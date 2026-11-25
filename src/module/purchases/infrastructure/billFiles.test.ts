import { uploadBillFiles } from './purchaseApi';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });
const kindOf = (call: unknown[]) => (call[1] as FormData).get('kind');
const namesOf = (call: unknown[]) =>
  (call[1] as FormData).getAll('attachments').map((file) => (file as File).name);

describe('uploadBillFiles', () => {
  beforeEach(() => {
    http.post.mockReset();
    http.post.mockResolvedValue({ data: {} });
  });

  it('sends the vendor invoice and the tax invoice as two uploads of their own kind', async () => {
    await uploadBillFiles('b1', { invoice: [pdf('inv.pdf')], tax: [pdf('pajak.pdf')] });

    expect(http.post).toHaveBeenCalledTimes(2);
    expect(http.post.mock.calls[0][0]).toBe('/v1/purchase-bills/b1/attachments');
    expect(kindOf(http.post.mock.calls[0])).toBe('VENDOR_INVOICE');
    expect(namesOf(http.post.mock.calls[0])).toEqual(['inv.pdf']);
    expect(kindOf(http.post.mock.calls[1])).toBe('TAX_INVOICE');
    expect(namesOf(http.post.mock.calls[1])).toEqual(['pajak.pdf']);
  });

  it('starts the second upload only after the first one is done', async () => {
    let release: (value: unknown) => void = () => undefined;
    http.post.mockReturnValueOnce(
      new Promise((resolve) => {
        release = resolve;
      })
    );

    const sending = uploadBillFiles('b1', { invoice: [pdf('inv.pdf')], tax: [pdf('pajak.pdf')] });
    await Promise.resolve();
    expect(http.post).toHaveBeenCalledTimes(1);

    release({ data: {} });
    await sending;
    expect(http.post).toHaveBeenCalledTimes(2);
  });

  it('sends nothing for a field left empty', async () => {
    await uploadBillFiles('b1', { invoice: [], tax: [pdf('pajak.pdf')] });

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(kindOf(http.post.mock.calls[0])).toBe('TAX_INVOICE');
  });

  it('sends no request when no file was chosen', async () => {
    await uploadBillFiles('b1', { invoice: [], tax: [] });

    expect(http.post).not.toHaveBeenCalled();
  });

  it('still sends the second file when the first one fails, and reports the failure', async () => {
    http.post.mockRejectedValueOnce(new Error('network'));

    await expect(
      uploadBillFiles('b1', { invoice: [pdf('inv.pdf')], tax: [pdf('pajak.pdf')] })
    ).rejects.toThrow();
    expect(http.post).toHaveBeenCalledTimes(2);
  });
});
