import apiClient from '@/lib/http/apiClient';
import {
  getPendingVouchersReport,
  getReconciliationReport,
  listAuditLog,
} from '@/module/petty-cash/infrastructure/pettyCashReportApi';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const reply = (data: unknown) => ({ data: { code: 200, message: 'ok', data } }) as never;

describe('report API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('flattens the fund of each pending voucher to its code', async () => {
    get.mockResolvedValue(
      reply({
        asOf: '2026-10-31',
        summary: {},
        total: 20000,
        items: [{ id: 'v1', fund: { id: 'f', code: 'PC-HQ', name: 'x' }, voucherNumber: 'PCV/1' }],
      })
    );
    const report = await getPendingVouchersReport('f', '2026-10-31');
    expect(report.items[0]).toMatchObject({ fundCode: 'PC-HQ', voucherNumber: 'PCV/1' });
    expect(get.mock.calls[0]?.[1]).toMatchObject({ params: { fundId: 'f', asOf: '2026-10-31' } });
  });

  it('reads the account number of the fund in the reconciliation', async () => {
    get.mockResolvedValue(
      reply([
        {
          fund: { id: 'f', code: 'PC-HQ', name: 'x', account: { accountNumber: '1-10002' } },
          pagu: 1,
          isOk: true,
        },
      ])
    );
    const rows = await getReconciliationReport();
    expect(rows[0]?.fund.accountNumber).toBe('1-10002');
  });

  it('keeps only what the timeline needs from an audit entry', async () => {
    get.mockResolvedValue(
      reply({
        results: [
          { id: 'a', action: 'APPROVE', performedBy: null, reason: null, createdAt: 't', ip: 'x' },
        ],
        page: 1,
        limit: 50,
        totalPages: 1,
        totalResults: 1,
      })
    );
    const page = await listAuditLog('VOUCHER', 'v1');
    expect(page.items[0]).toEqual({
      id: 'a',
      action: 'APPROVE',
      byName: '',
      reason: null,
      createdAt: 't',
    });
  });
});
