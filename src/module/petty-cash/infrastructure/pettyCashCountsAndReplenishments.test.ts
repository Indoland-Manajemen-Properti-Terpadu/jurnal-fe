import apiClient from '@/lib/http/apiClient';
import {
  approveCount,
  createCount,
  listCounts,
  rejectCount,
  submitCount,
} from '@/module/petty-cash/infrastructure/pettyCashCountApi';
import {
  cancelReplenishment,
  createReplenishment,
  disburseReplenishment,
  getReimbursement,
  listReimbursements,
  previewReplenishment,
} from '@/module/petty-cash/infrastructure/pettyCashReplenishmentApi';
import { toCount, toReimbursement } from '@/module/petty-cash/infrastructure/pettyCashMappers';
import type { CountDto, ReimbursementDto } from '@/module/petty-cash/infrastructure/pettyCashDto';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

const user = { id: 'u1', name: 'TEST PC Witness', email: 'w@x.id' };

const countDto: CountDto = {
  id: 'c1',
  fund: { id: 'f1', code: 'PC-HQ', name: 'Kas Kecil HQ', custodian: 'u-custodian' },
  countNumber: 'PCO/202610/0001',
  countedAt: '2026-10-31T10:45:13.231Z',
  countedBy: user,
  witnessedBy: { ...user, id: 'u2', name: 'TEST PC Staff' },
  denominations: {
    '1000': 0,
    '2000': 2,
    '100000': 35,
    coins: { '100': 0, '200': 0, '500': 4, '1000': 0 },
  },
  totalPhysicalCash: 3569000,
  pendingVoucherTotal: 1411000,
  outstandingAdvanceTotal: 0,
  expectedCash: 3589000,
  varianceAmount: -20000,
  varianceType: 'SHORT',
  reason: 'selisih kurang',
  status: 'SUBMITTED',
  submittedAt: '2026-10-31T10:45:13.247Z',
  approvedBy: null,
  approvedAt: null,
  rejectedBy: null,
  rejectedAt: null,
  rejectedReason: null,
  settledByReimbursement: null,
  isStale: false,
  createdAt: '2026-10-31T10:45:13.243Z',
};

const reimbursementBase = {
  id: 'r1',
  reimbursementNumber: 'PCR/202610/0003',
  fund: { id: 'f1', code: 'PC-HQ', name: 'Kas Kecil HQ', custodian: 'u-custodian' },
  requestDate: '2026-10-31T00:00:00.000Z',
  bankAccount: { id: 'b1', name: 'Bank Mandiri', accountNumber: '1-10003' },
  count: null,
  voucherTotal: 1411000,
  varianceAmount: -20000,
  totalAmount: 1431000,
  status: 'SUBMITTED',
  notes: null,
  submittedBy: user,
  submittedAt: '2026-10-31T10:45:39.595Z',
  approvedBy: null,
  approvedAt: null,
  rejectedBy: null,
  rejectedAt: null,
  rejectedReason: null,
  cancelledBy: null,
  cancelledAt: null,
  disbursedBy: null,
  disbursedAt: null,
  disbursementDate: null,
  journal: null,
} as const;

describe('toCount', () => {
  it('separates the notes from the nested coins and keeps the backend figures', () => {
    const count = toCount(countDto);
    expect(count.denominations.notes).toEqual({ '1000': 0, '2000': 2, '100000': 35 });
    expect(count.denominations.coins).toEqual({ '100': 0, '200': 0, '500': 4, '1000': 0 });
    expect(count.fund.custodianId).toBe('u-custodian');
    expect(count).toMatchObject({
      expectedCash: 3589000,
      varianceAmount: -20000,
      varianceType: 'SHORT',
      isStale: false,
    });
  });

  it('treats a missing isStale as not stale', () => {
    const { isStale: _ignored, ...withoutFlag } = countDto;
    expect(toCount(withoutFlag).isStale).toBe(false);
  });
});

describe('toReimbursement', () => {
  it('reads a list item whose items carry only the voucher id', () => {
    const dto = {
      ...reimbursementBase,
      items: [{ voucher: 'v1', amount: 420000 }],
    } as ReimbursementDto;
    const record = toReimbursement(dto);
    expect(record.items).toEqual([{ voucherId: 'v1', voucher: null, amount: 420000 }]);
    expect(record.requestDate).toBe('2026-10-31');
    expect(record.journalId).toBeNull();
    expect(record.cashBalanceAfter).toBeNull();
  });

  it('reads a detail with voucher summaries, dates cut to the day, and the balance after payout', () => {
    const dto = {
      ...reimbursementBase,
      status: 'DISBURSED',
      disbursementDate: '2026-10-31T00:00:00.000Z',
      journal: 'j1',
      cashBalanceAfter: 5000000,
      items: [
        {
          voucher: {
            id: 'v1',
            voucherNumber: 'PCV/202610/0001',
            transactionDate: '2026-10-25T00:00:00.000Z',
            beneficiary: 'Toko A',
            totalAmount: 161000,
            status: 'REIMBURSED',
          },
          amount: 161000,
        },
      ],
    } as ReimbursementDto;
    const record = toReimbursement(dto);
    expect(record.items[0].voucher).toMatchObject({
      voucherNumber: 'PCV/202610/0001',
      transactionDate: '2026-10-25',
    });
    expect(record).toMatchObject({
      disbursementDate: '2026-10-31',
      journalId: 'j1',
      cashBalanceAfter: 5000000,
    });
  });
});

const ok = (data: unknown) => ({ data: { code: 200, message: 'ok', data } }) as never;
const page = (results: unknown[]) => ({
  results,
  page: 1,
  limit: 25,
  totalPages: 1,
  totalResults: results.length,
});

describe('count API', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('lists counts with only the accepted filters', async () => {
    get.mockResolvedValue(ok(page([countDto])));
    const result = await listCounts({ fundId: 'f1', status: ['SUBMITTED', 'APPROVED'], page: 2 });
    expect(get).toHaveBeenCalledWith('/v1/petty-cash/counts', {
      params: { fundId: 'f1', status: 'SUBMITTED,APPROVED', page: 2 },
      timeout: 30000,
    });
    expect(result.items[0].countNumber).toBe('PCO/202610/0001');
  });

  it('creates a count with the key and the submit flag', async () => {
    post.mockResolvedValue(ok(countDto));
    const input = { witnessedBy: 'u2', denominations: { '100000': 1, coins: { '100': 0 } } };
    await createCount({ fundId: 'f1', input, submit: true }, 'key-1');
    expect(post).toHaveBeenCalledWith(
      '/v1/petty-cash/counts',
      { fundId: 'f1', ...input, submit: true },
      { timeout: 60000, headers: { 'Idempotency-Key': 'key-1' } }
    );
  });

  it('submits with the saved reason, approves, and rejects with a trimmed reason', async () => {
    post.mockResolvedValue(ok(countDto));
    await submitCount('c1', ' selisih ', 'k1');
    expect(post.mock.calls[0]).toEqual([
      '/v1/petty-cash/counts/c1/submit',
      { reason: 'selisih' },
      { timeout: 60000, headers: { 'Idempotency-Key': 'k1' } },
    ]);
    await submitCount('c1', null, 'k2');
    expect(post.mock.calls[1][1]).toBeUndefined();
    await approveCount('c1', 'k3');
    expect(post.mock.calls[2][0]).toBe('/v1/petty-cash/counts/c1/approve');
    await rejectCount('c1', '  hitung ulang  ', 'k4');
    expect(post.mock.calls[3][1]).toEqual({ reason: 'hitung ulang' });
  });
});

describe('replenishment API', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  const detail = { ...reimbursementBase, items: [] };

  it('lists and reads a replenishment', async () => {
    get.mockResolvedValue(
      ok(page([{ ...reimbursementBase, items: [{ voucher: 'v1', amount: 1 }] }]))
    );
    const list = await listReimbursements({ fundId: 'f1', status: ['SUBMITTED'] });
    expect(list.items[0].items[0].voucherId).toBe('v1');
    get.mockResolvedValue(ok(detail));
    expect((await getReimbursement('r1')).reimbursementNumber).toBe('PCR/202610/0003');
    expect(get).toHaveBeenLastCalledWith('/v1/petty-cash/reimbursements/r1', { timeout: 30000 });
  });

  it('previews without an idempotency key and creates with one', async () => {
    post.mockResolvedValue(
      ok({
        voucherTotal: 1411000,
        varianceAmount: -20000,
        varianceType: 'SHORT',
        totalAmount: 1431000,
        voucherCount: 3,
        countId: 'c1',
        expenseBreakdown: [],
        taxBreakdown: [],
        journalPreview: [],
        isBalanced: true,
        cashAfterDisbursement: 5000000,
        warnings: [],
      })
    );
    const input = { fundId: 'f1', voucherIds: ['v1'], bankAccountId: 'b1', countId: 'c1' };
    const preview = await previewReplenishment({ ...input, disbursementDate: '2026-10-31' });
    expect(preview.totalAmount).toBe(1431000);
    expect(post.mock.calls[0]).toEqual([
      '/v1/petty-cash/reimbursements/preview',
      { ...input, disbursementDate: '2026-10-31' },
      { timeout: 60000 },
    ]);

    post.mockResolvedValue(ok(detail));
    await createReplenishment(input, 'key-9');
    expect(post.mock.calls[1]).toEqual([
      '/v1/petty-cash/reimbursements',
      input,
      { timeout: 60000, headers: { 'Idempotency-Key': 'key-9' } },
    ]);
  });

  it('cancels with a reason and disburses with the accounting date', async () => {
    post.mockResolvedValue(ok(detail));
    await cancelReplenishment('r1', '  salah pilih  ', 'k1');
    expect(post.mock.calls[0][0]).toBe('/v1/petty-cash/reimbursements/r1/cancel');
    expect(post.mock.calls[0][1]).toEqual({ reason: 'salah pilih' });
    await disburseReplenishment('r1', '2026-10-31', 'k2');
    expect(post.mock.calls[1][0]).toBe('/v1/petty-cash/reimbursements/r1/disburse');
    expect(post.mock.calls[1][1]).toEqual({ disbursementDate: '2026-10-31' });
  });
});
