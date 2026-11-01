import apiClient from '@/lib/http/apiClient';
import {
  approveVoucher,
  createVoucher,
  deleteVoucherAttachment,
  rejectVoucher,
  submitVoucher,
  updateVoucher,
  uploadVoucherAttachments,
  voidVoucher,
} from '@/module/petty-cash/infrastructure/pettyCashApi';
import { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import type { VoucherInput } from '@/module/petty-cash/domain/voucherForm';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const post = vi.mocked(apiClient.post);
const patch = vi.mocked(apiClient.patch);
const del = vi.mocked(apiClient.delete);

const voucherDto = {
  id: 'v1',
  fund: { id: 'f1', code: 'PC-HQ', name: 'Kas Kecil HQ', custodian: 'u1' },
  voucherNumber: 'PCV/202610/0013',
  source: 'DIRECT',
  advance: null,
  transactionDate: '2026-10-31T00:00:00.000Z',
  beneficiary: 'Toko A',
  description: '',
  receiptNumber: '',
  taxInvoiceNumber: null,
  vendorTaxId: null,
  lines: [],
  totalAmount: 1000,
  status: 'DRAFT',
  requestedBy: null,
  submittedAt: null,
  approvedBy: null,
  approvedAt: null,
  rejectedReason: null,
  rejectedAt: null,
  voidReason: null,
  voidedAt: null,
  reimbursement: null,
  createdAt: '2026-10-31T10:00:00.000Z',
  updatedAt: '2026-10-31T10:00:00.000Z',
};
const ok = { data: { code: 201, message: 'ok', data: voucherDto } } as never;

const input: VoucherInput = {
  date: '2026-10-31',
  beneficiary: 'Toko A',
  lines: [{ expenseAccountId: 'acc1', amount: 1000 }],
};

const httpError = (status: number, data: unknown) =>
  Object.assign(new Error(`status ${status}`), {
    isAxiosError: true,
    response: { status, statusText: '', data },
  });

describe('voucher writes', () => {
  beforeEach(() => {
    post.mockReset();
    patch.mockReset();
    del.mockReset();
  });

  it('creates a voucher as JSON with the idempotency key when there are no files', async () => {
    post.mockResolvedValue(ok);

    const voucher = await createVoucher({ fundId: 'f1', input, submit: false }, 'key-1');

    expect(voucher.voucherNumber).toBe('PCV/202610/0013');
    expect(voucher.transactionDate).toBe('2026-10-31');
    expect(post).toHaveBeenCalledWith(
      '/v1/petty-cash/vouchers',
      { fundId: 'f1', ...input, submit: false },
      { timeout: 60000, headers: { 'Idempotency-Key': 'key-1' } }
    );
  });

  it('creates a multipart voucher when receipts travel with it', async () => {
    post.mockResolvedValue(ok);
    const file = new File(['x'], 'nota.png', { type: 'image/png' });

    await createVoucher(
      { fundId: 'f1', input: { ...input, receiptNumber: 'R-1' }, submit: true, files: [file] },
      'key-2'
    );

    const [url, form, config] = post.mock.calls[0] as unknown as [string, FormData, unknown];
    expect(url).toBe('/v1/petty-cash/vouchers');
    expect(form).toBeInstanceOf(FormData);
    expect(form.get('fundId')).toBe('f1');
    expect(form.get('submit')).toBe('true');
    expect(form.get('receiptNumber')).toBe('R-1');
    expect(form.has('description')).toBe(false);
    expect(JSON.parse(form.get('lines') as string)).toEqual(input.lines);
    expect((form.getAll('attachments')[0] as File).name).toBe('nota.png');
    expect(config).toEqual({ timeout: 120000, headers: { 'Idempotency-Key': 'key-2' } });
  });

  it('updates with PATCH and never submits as part of the update', async () => {
    patch.mockResolvedValue(ok);
    await updateVoucher('v1', input);
    expect(patch).toHaveBeenCalledWith(
      '/v1/petty-cash/vouchers/v1',
      { ...input, submit: false },
      { timeout: 60000 }
    );
  });

  it.each([
    ['submit', () => submitVoucher('v1', 'k')],
    ['approve', () => approveVoucher('v1', 'k')],
  ])('%s posts without a body and with the key', async (action, call) => {
    post.mockResolvedValue(ok);
    await call();
    expect(post).toHaveBeenCalledWith(`/v1/petty-cash/vouchers/v1/${action}`, undefined, {
      timeout: 60000,
      headers: { 'Idempotency-Key': 'k' },
    });
  });

  it.each([
    ['reject', () => rejectVoucher('v1', '  nota tidak jelas  ', 'k')],
    ['void', () => voidVoucher('v1', '  salah input  ', 'k')],
  ])('%s sends the trimmed reason', async (action, call) => {
    post.mockResolvedValue(ok);
    await call();
    const [url, body] = post.mock.calls[0];
    expect(url).toBe(`/v1/petty-cash/vouchers/v1/${action}`);
    expect(body).toEqual({ reason: action === 'reject' ? 'nota tidak jelas' : 'salah input' });
  });

  it('uploads receipts as multipart and deletes one by id', async () => {
    post.mockResolvedValue(ok);
    del.mockResolvedValue(ok);
    const file = new File(['x'], 'nota.pdf', { type: 'application/pdf' });

    await uploadVoucherAttachments('v1', [file]);
    const [url, form] = post.mock.calls[0] as unknown as [string, FormData];
    expect(url).toBe('/v1/petty-cash/vouchers/v1/attachments');
    expect((form.getAll('attachments')[0] as File).name).toBe('nota.pdf');

    await deleteVoucherAttachment('v1', 'a1');
    expect(del).toHaveBeenCalledWith('/v1/petty-cash/vouchers/v1/attachments/a1', {
      timeout: 60000,
    });
  });

  it('rethrows a normalized error with the domain code', async () => {
    post.mockRejectedValue(
      httpError(400, { message: 'Voucher wajib bukti', data: { errorCode: 'ATTACHMENT_REQUIRED' } })
    );

    const failure = await createVoucher({ fundId: 'f1', input, submit: true }, 'k').catch(
      (error: unknown) => error
    );

    expect(failure).toBeInstanceOf(PettyCashError);
    expect(failure).toMatchObject({ kind: 'domain', code: 'ATTACHMENT_REQUIRED' });
  });

  it('sets a longer timeout for uploads than for ordinary writes, and a timeout is an unknown outcome', async () => {
    post.mockResolvedValue(ok);
    await uploadVoucherAttachments('v1', [new File(['x'], 'a.png', { type: 'image/png' })]);
    expect((post.mock.calls[0][2] as { timeout: number }).timeout).toBe(120000);

    post.mockRejectedValue(
      Object.assign(new Error('timeout of 60000ms exceeded'), {
        isAxiosError: true,
        code: 'ECONNABORTED',
      })
    );
    const failure = await approveVoucher('v1', 'k').catch((error: unknown) => error);
    expect(failure).toMatchObject({ kind: 'network' });
  });
});
