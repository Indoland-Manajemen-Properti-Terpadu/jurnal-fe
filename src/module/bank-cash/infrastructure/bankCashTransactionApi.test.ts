import { AxiosError } from 'axios';
import apiClient from '@/lib/http/apiClient';
import { submitBankCashTransaction } from './bankCashTransactionApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { post: vi.fn() } }));

const post = vi.mocked(apiClient.post);
const serverError = (status: number, data: unknown, statusText = '') =>
  new AxiosError('failed', String(status), undefined, undefined, {
    status,
    statusText,
    data,
    headers: {},
    config: {} as never,
  });

const payload = {
  transactionDate: '2026-01-31',
  notes: '  Setoran  ',
  transactionDetail: [
    { account: 'cash', description: 'Masuk', debit: 100 },
    { account: 'rev', description: 'Sumber', credit: 100 },
  ],
};

describe('submitBankCashTransaction', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('posts only the sides a line has and trims the notes', async () => {
    post.mockResolvedValue({ status: 201, data: { id: 'j1' } } as never);

    const result = await submitBankCashTransaction(payload);

    expect(result).toEqual({ id: 'j1' });
    expect(post.mock.calls[0][1]).toEqual({
      transactionDate: '2026-01-31',
      notes: 'Setoran',
      transactionDetail: [
        { account: 'cash', description: 'Masuk', debit: 100 },
        { account: 'rev', description: 'Sumber', credit: 100 },
      ],
    });
  });

  it('omits blank notes, an empty tag list and a NaN transaction number', async () => {
    post.mockResolvedValue({ status: 200, data: {} } as never);

    await submitBankCashTransaction({
      ...payload,
      notes: '   ',
      tags: [],
      transactionNumber: Number.NaN,
    });

    expect(post.mock.calls[0][1]).not.toHaveProperty('notes');
    expect(post.mock.calls[0][1]).not.toHaveProperty('tags');
    expect(post.mock.calls[0][1]).not.toHaveProperty('transactionNumber');
  });

  it('throws the server message when the server rejects the journal', async () => {
    post.mockRejectedValue(serverError(400, { message: 'Periode terkunci' }));

    await expect(submitBankCashTransaction(payload)).rejects.toThrow('Periode terkunci');
  });

  it('falls back to the status text, then to a default message', async () => {
    post.mockRejectedValueOnce(serverError(502, {}, 'Bad Gateway'));
    await expect(submitBankCashTransaction(payload)).rejects.toThrow('Bad Gateway');

    post.mockRejectedValueOnce(new Error('Network Error'));
    await expect(submitBankCashTransaction(payload)).rejects.toThrow(
      'Gagal membukukan transaksi kas & bank ke sistem akuntansi.'
    );
  });
});
