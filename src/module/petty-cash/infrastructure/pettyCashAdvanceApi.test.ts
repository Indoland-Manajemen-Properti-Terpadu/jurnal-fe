import apiClient from '@/lib/http/apiClient';
import {
  approveAdvance,
  createAdvance,
  getMyAdvanceStatus,
  setSettlementAccounts,
  submitAdvanceSettlement,
} from '@/module/petty-cash/infrastructure/pettyCashAdvanceApi';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);
const patch = vi.mocked(apiClient.patch);

const advanceDto = {
  id: 'a1',
  advanceNumber: 'PCA/202610/0006',
  fund: { id: 'f1', code: 'PC-HQ', name: 'Kas Kecil HQ', custodian: 'u1' },
  requester: { id: 'u2', name: 'Staf' },
  purpose: 'Perjalanan dinas',
  requestedAmount: 500000,
  amount: 400000,
  status: 'DISBURSED',
  approvedBy: null,
  approvedAt: null,
  rejectedReason: null,
  disbursedBy: null,
  disbursedAt: null,
  dueAt: null,
  cashSettledNet: 0,
  custodianVerifiedBy: null,
  custodianVerifiedAt: null,
  financeVerifiedBy: null,
  financeVerifiedAt: null,
  settlementRejectedReason: null,
  voucher: 'v-id-only',
  receivableJournal: null,
  receivableAmount: 0,
  convertedAt: null,
  statusHistory: [{ status: 'DISBURSED', at: '2026-10-31T00:00:00.000Z', by: 'u1', note: null }],
  settlement: { lines: [{ lineNo: 1, expenseAccount: 'acc-id', description: 'Taksi', amount: 1 }] },
  outstandingAmount: 400000,
  isOverdue: false,
  createdAt: '2026-10-31T00:00:00.000Z',
};
const ok = { data: { code: 200, message: 'ok', data: advanceDto } } as never;

describe('advance API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads list-shaped detail: voucher and account as bare ids become null', async () => {
    post.mockResolvedValue(ok);
    const advance = await createAdvance({ fundId: 'f1', amount: 500000, purpose: 'x' }, 'k1');
    expect(advance.voucher).toBeNull();
    expect(advance.settlement.lines[0]?.expenseAccount).toBeNull();
    expect(advance.fund.custodianId).toBe('u1');
    expect(advance.statusHistory[0]?.byId).toBe('u1');
  });

  it('sends the idempotency key with the approval', async () => {
    post.mockResolvedValue(ok);
    await approveAdvance('a1', { amount: 400000 }, 'k2');
    const [url, body, config] = post.mock.calls[0] as [string, unknown, { headers: object }];
    expect(url).toContain('/advances/a1/approve');
    expect(body).toEqual({ amount: 400000 });
    expect(JSON.stringify(config.headers)).toContain('k2');
  });

  it('sends a settlement with receipts as multipart with lines as JSON text', async () => {
    post.mockResolvedValue(ok);
    const file = new File(['x'], 'nota.png', { type: 'image/png' });
    await submitAdvanceSettlement(
      'a1',
      {
        input: {
          date: '2026-10-31',
          beneficiary: 'Toko',
          lines: [{ description: 'a', amount: 1 }],
        },
        files: [file],
      },
      'k3'
    );
    const form = post.mock.calls[0]?.[1] as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(form.get('lines')).toBe(JSON.stringify([{ description: 'a', amount: 1 }]));
    expect(form.getAll('attachments')).toHaveLength(1);
  });

  it('patches settlement accounts', async () => {
    patch.mockResolvedValue(ok);
    await setSettlementAccounts('a1', [{ lineNo: 1, expenseAccountId: 'acc' }]);
    expect(patch.mock.calls[0]?.[0]).toContain('/advances/a1/settlement-accounts');
  });

  it('maps the restriction status', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          user: { id: 'u2', name: 'Staf' },
          isBlocked: true,
          reasons: [{ type: 'OVERDUE', reason: 'Jatuh tempo' }],
          restriction: null,
          outstandingAmount: 400000,
        },
      },
    } as never);
    const status = await getMyAdvanceStatus();
    expect(status.isBlocked).toBe(true);
    expect(status.overrideUntil).toBeNull();
    expect(status.reasons[0]?.since).toBeNull();
  });
});
