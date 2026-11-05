import {
  bucketShares,
  normalizeAgingRow,
  overdueAmount,
} from '@/module/purchases/domain/payablesView';

const totals = {
  billCount: 3,
  totalRemaining: 1000,
  current: 400,
  days1to30: 300,
  days31to60: 200,
  days61to90: 50,
  over90: 50,
};

describe('payablesView', () => {
  it('sums everything past due', () => {
    expect(overdueAmount(totals)).toBe(600);
  });

  it('gives each bucket its share of the whole', () => {
    const shares = bucketShares(totals);
    expect(shares.map((s) => s.share)).toEqual([0.4, 0.3, 0.2, 0.05, 0.05]);
  });

  it('reads the vendor name from the real row shape', () => {
    const row = normalizeAgingRow({
      vendor: { id: 'v1', name: 'Firman GM' },
      billCount: 1,
      totalRemaining: 10000,
      current: 10000,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      over90: 0,
    });
    expect(row).toMatchObject({ vendorId: 'v1', vendorName: 'Firman GM' });
  });

  it('shows no shares when nothing is owed', () => {
    expect(bucketShares({ ...totals, totalRemaining: 0 }).every((s) => s.share === 0)).toBe(true);
  });
});
