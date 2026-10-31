import { summarizeReimbursement } from './reimbursementSummary';

const voucher = (code: string, name: string, amount: number) => ({
  amount,
  expenseAccount: { code, name },
});

describe('summarizeReimbursement', () => {
  it('totals the vouchers to the cent', () => {
    const summary = summarizeReimbursement([
      voucher('6-1001', 'ATK', 0.1),
      voucher('6-1002', 'Bensin', 0.2),
    ]);

    expect(summary.total).toBe(0.3);
  });

  it('groups the breakdown by expense account in first-seen order', () => {
    const summary = summarizeReimbursement([
      voucher('6-1001', 'ATK', 0.1),
      voucher('6-1002', 'Bensin', 50),
      voucher('6-1001', 'ATK', 0.2),
    ]);

    expect(summary.breakdown).toEqual([
      { code: '6-1001', name: 'ATK', amount: 0.3 },
      { code: '6-1002', name: 'Bensin', amount: 50 },
    ]);
  });

  it('returns zero and no lines for no vouchers', () => {
    expect(summarizeReimbursement([])).toEqual({ total: 0, breakdown: [] });
  });
});
