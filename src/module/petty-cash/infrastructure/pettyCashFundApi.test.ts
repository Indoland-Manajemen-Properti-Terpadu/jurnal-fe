import apiClient from '@/lib/http/apiClient';
import {
  adjustPagu,
  closeFund,
  createFund,
  updateFund,
} from '@/module/petty-cash/infrastructure/pettyCashFundApi';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const post = vi.mocked(apiClient.post);
const patch = vi.mocked(apiClient.patch);

const fundDto = {
  id: 'f1',
  code: 'PC-X',
  name: 'Dana X',
  account: { id: 'a', name: 'Kas', accountNumber: '1-1' },
  pagu: 1,
  custodian: { id: 'u', name: 'P' },
  status: 'ACTIVE',
  closedAt: null,
  lastCountAt: null,
  createdAt: 't',
  updatedAt: 't',
};
const ok = { data: { code: 200, message: 'ok', data: fundDto } } as never;

describe('fund administration API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    post.mockResolvedValue(ok);
    patch.mockResolvedValue(ok);
  });

  it('creates with an idempotency key', async () => {
    await createFund({ code: 'PC-X' } as never, 'k1');
    const [url, body, config] = post.mock.calls[0] as [string, unknown, { headers: object }];
    expect(url).toBe('/v1/petty-cash/funds');
    expect(body).toEqual({ code: 'PC-X' });
    expect(JSON.stringify(config.headers)).toContain('k1');
  });

  it('patches only what it is given', async () => {
    await updateFund('f1', { advanceSettlementDays: 14 });
    expect(patch.mock.calls[0]?.[0]).toBe('/v1/petty-cash/funds/f1');
    expect(patch.mock.calls[0]?.[1]).toEqual({ advanceSettlementDays: 14 });
  });

  it('posts a ceiling adjustment and a closing to their own paths', async () => {
    await adjustPagu(
      'f1',
      { newPagu: 2, bankAccountId: 'b', date: '2026-10-31', reason: 'x' },
      'k2'
    );
    await closeFund('f1', { bankAccountId: 'b', date: '2026-10-31', reason: ' selesai ' }, 'k3');
    expect(post.mock.calls[0]?.[0]).toBe('/v1/petty-cash/funds/f1/pagu-adjustments');
    expect(post.mock.calls[1]?.[0]).toBe('/v1/petty-cash/funds/f1/close');
    expect(post.mock.calls[1]?.[1]).toMatchObject({ reason: 'selesai' });
  });
});
