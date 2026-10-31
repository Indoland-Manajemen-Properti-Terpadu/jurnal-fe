import { calculateCashCount } from './cashCount';

describe('calculateCashCount', () => {
  const vouchers = [
    { fundId: 'f', amount: 0.1, status: 'PAID' as const },
    { fundId: 'f', amount: 0.2, status: 'REIMBURSEMENT_PENDING' as const },
    { fundId: 'f', amount: 500, status: 'REIMBURSED' as const },
    { fundId: 'other', amount: 900, status: 'PAID' as const },
  ];

  it('adds the cash in hand to the unreimbursed vouchers of the fund only', () => {
    const result = calculateCashCount({
      fundId: 'f',
      pagu: 1000,
      counts: { 100000: 0, 50000: 0 },
      denominations: [100000, 50000],
      vouchers,
    });

    expect(result.totalUnreimbursedVouchers).toBe(0.3);
    expect(result.actualTotal).toBe(0.3);
    expect(result.variance).toBe(-999.7);
    expect(result.status).toBe('SHORT');
  });

  it('is balanced when cash plus vouchers equal the ceiling to the cent', () => {
    const result = calculateCashCount({
      fundId: 'f',
      pagu: 100000.3,
      counts: { 100000: 1 },
      denominations: [100000],
      vouchers,
    });

    expect(result).toMatchObject({ totalPhysicalCash: 100000, variance: 0, status: 'BALANCED' });
  });

  it('reports a surplus as OVER', () => {
    const result = calculateCashCount({
      fundId: 'f',
      pagu: 50000,
      counts: { 50000: 2 },
      denominations: [50000],
      vouchers: [],
    });

    expect(result).toMatchObject({ totalPhysicalCash: 100000, variance: 50000, status: 'OVER' });
  });
});
