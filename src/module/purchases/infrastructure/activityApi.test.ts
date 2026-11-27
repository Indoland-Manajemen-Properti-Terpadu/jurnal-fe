import { getActivity, toActivityEntry } from './purchaseApi';

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const dto = {
  id: 'a1',
  action: 'APPROVE',
  actionLabel: 'Disetujui',
  stage: 'REQUEST',
  stageLabel: 'Pengadaan',
  step: 1,
  totalSteps: 2,
  role: { id: 'r1', name: 'Chief Finance' },
  by: { id: 'u1', name: 'Budi' },
  at: '2026-11-25T03:00:00.000Z',
  note: 'sesuai anggaran',
  text: 'Disetujui, langkah 1 dari 2 (Chief Finance)',
};

describe('toActivityEntry', () => {
  it('reads who did what, when, at which step and with which note', () => {
    expect(toActivityEntry(dto)).toEqual({
      id: 'a1',
      action: 'APPROVE',
      label: 'Disetujui',
      step: 1,
      totalSteps: 2,
      stageLabel: 'Pengadaan',
      roleName: 'Chief Finance',
      byName: 'Budi',
      at: '2026-11-25T03:00:00.000Z',
      note: 'sesuai anggaran',
      text: 'Disetujui, langkah 1 dari 2 (Chief Finance)',
    });
  });

  it('copes with an entry that has no role, person, step or note', () => {
    expect(
      toActivityEntry({ action: 'CREATE', actionLabel: 'Dibuat', at: '2026-11-25T03:00:00.000Z' })
    ).toMatchObject({
      label: 'Dibuat',
      stageLabel: '',
      roleName: '',
      byName: '',
      step: null,
      totalSteps: null,
      note: '',
    });
  });
});

describe('getActivity', () => {
  beforeEach(() => {
    http.get.mockReset();
  });

  it('reads the log of each kind of document from its own address', async () => {
    http.get.mockResolvedValue({ data: { data: [dto] } });

    const entries = await getActivity('receipt', 'gr1');

    expect(http.get.mock.calls[0][0]).toBe('/v1/goods-receipts/gr1/activity');
    expect(entries).toHaveLength(1);
    expect(entries[0].stageLabel).toBe('BAPP');
    const requestEntries = await getActivity('request', 'pr1');
    expect(requestEntries[0].stageLabel).toBe('Pengadaan');
    expect(http.get.mock.calls[1][0]).toBe('/v1/purchase-requests/pr1/activity');
    await getActivity('paymentRequest', 'pp1');
    expect(http.get.mock.calls[2][0]).toBe('/v1/purchase-payment-requests/pp1/activity');
  });

  it('answers an empty log when the service has no such address yet', async () => {
    http.get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: { code: 404, message: 'Not found' } },
    });

    expect(await getActivity('receipt', 'gr1')).toEqual([]);
  });

  it('still fails on any other error', async () => {
    http.get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500, data: { code: 500, message: 'x' } },
    });

    await expect(getActivity('receipt', 'gr1')).rejects.toBeDefined();
  });
});
