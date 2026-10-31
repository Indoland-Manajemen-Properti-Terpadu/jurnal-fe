import { postV2 } from '@/lib/http/apiClient';
import { submitBankCashTransaction } from './bankCashTransactionApi';

vi.mock('@/lib/http/apiClient', () => ({ postV2: vi.fn() }));

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
    vi.mocked(postV2).mockReset();
  });

  it('posts only the sides a line has and trims the notes', async () => {
    vi.mocked(postV2).mockResolvedValue({ status: 201, data: { id: 'j1' } } as never);

    const result = await submitBankCashTransaction(payload);

    expect(result).toEqual({ id: 'j1' });
    expect(vi.mocked(postV2).mock.calls[0][1]).toEqual({
      transactionDate: '2026-01-31',
      notes: 'Setoran',
      transactionDetail: [
        { account: 'cash', description: 'Masuk', debit: 100 },
        { account: 'rev', description: 'Sumber', credit: 100 },
      ],
    });
  });

  it('omits blank notes, an empty tag list and a NaN transaction number', async () => {
    vi.mocked(postV2).mockResolvedValue({ status: 200, data: {} } as never);

    await submitBankCashTransaction({
      ...payload,
      notes: '   ',
      tags: [],
      transactionNumber: Number.NaN,
    });

    expect(vi.mocked(postV2).mock.calls[0][1]).not.toHaveProperty('notes');
    expect(vi.mocked(postV2).mock.calls[0][1]).not.toHaveProperty('tags');
    expect(vi.mocked(postV2).mock.calls[0][1]).not.toHaveProperty('transactionNumber');
  });

  it('throws the server message when the status is not 200 or 201', async () => {
    vi.mocked(postV2).mockResolvedValue({
      status: 400,
      data: { message: 'Periode terkunci' },
    } as never);

    await expect(submitBankCashTransaction(payload)).rejects.toThrow('Periode terkunci');
  });

  it('throws a default message when there is no response at all', async () => {
    vi.mocked(postV2).mockResolvedValue(null);

    await expect(submitBankCashTransaction(payload)).rejects.toThrow(
      'Gagal membukukan transaksi kas & bank ke sistem akuntansi.'
    );
  });
});
