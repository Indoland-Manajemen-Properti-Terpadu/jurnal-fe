import { describe, expect, it } from 'vitest';
import type {
  PettyCashFund,
  PettyCashReimbursement,
  PettyCashVoucher,
} from '@/module/petty-cash/domain/pettyCashTypes';
import {
  recordPaidVoucher,
  disburseReplenishment,
  findFundById,
  submitReplenishment,
  type PettyCashPrototypeState,
} from '@/module/petty-cash/domain/pettyCash';

const fund: PettyCashFund = {
  id: 'fund-hq',
  name: 'Kas Kecil HQ',
  code: '1-1102',
  pagu: 5_000_000,
  currentBalance: 3_800_000,
  pendingReimburseAmount: 1_200_000,
  custodianName: 'Siti',
  custodianRole: 'Custodian',
  minThresholdAlert: 1_000_000,
  bankSourceAccount: { id: 'bank-1', name: 'Bank Utama', accountNumber: '001' },
  status: 'ACTIVE',
  description: 'Dana operasional',
  lastOpnameDate: '2026-10-20T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const voucher: PettyCashVoucher = {
  id: 'voucher-1',
  fundId: fund.id,
  fundName: fund.name,
  voucherNumber: 'PCV/202610/0001',
  date: '2026-10-20T00:00:00.000Z',
  beneficiary: 'Vendor',
  expenseAccount: { id: 'expense-1', code: '6-1001', name: 'Beban ATK', category: 'Beban' },
  amount: 1_200_000,
  description: 'ATK',
  receiptNumber: 'INV-1',
  status: 'PENDING_REIMBURSE',
  createdAt: '2026-10-20T00:00:00.000Z',
  createdBy: 'Siti',
};

const reimbursement: PettyCashReimbursement = {
  id: 'reimbursement-1',
  fundId: fund.id,
  fundName: fund.name,
  reimbursementNumber: 'PCR/202610/0001',
  date: '2026-10-21T00:00:00.000Z',
  totalAmount: 1_200_000,
  voucherCount: 1,
  voucherIds: [voucher.id],
  bankAccountId: 'bank-1',
  bankAccountName: 'Bank Utama',
  bankAccountNumber: '001',
  status: 'SUBMITTED',
  requestedBy: 'Siti',
  expenseBreakdown: [{ accountCode: '6-1001', accountName: 'Beban ATK', amount: 1_200_000 }],
};

const state: PettyCashPrototypeState = {
  funds: [fund],
  vouchers: [voucher],
  reimbursements: [],
  cashCounts: [],
};

describe('petty cash replenishment lifecycle', () => {
  it('submits a replenishment without restoring cash or reimbursing vouchers', () => {
    const next = submitReplenishment(state, reimbursement);

    expect(next.funds[0].currentBalance).toBe(3_800_000);
    expect(next.funds[0].pendingReimburseAmount).toBe(1_200_000);
    expect(next.vouchers[0].status).toBe('REIMBURSEMENT_PENDING');
    expect(next.vouchers[0].reimbursementId).toBe(reimbursement.id);
    expect(next.reimbursements[0].status).toBe('SUBMITTED');
  });

  it('rejects a replenishment whose voucher total does not match', () => {
    expect(() =>
      submitReplenishment(state, { ...reimbursement, totalAmount: reimbursement.totalAmount - 1 })
    ).toThrow('REIMBURSEMENT_TOTAL_MISMATCH');
  });

  it('rejects vouchers from another fund or an ineligible lifecycle state', () => {
    expect(() =>
      submitReplenishment(
        { ...state, vouchers: [{ ...voucher, fundId: 'another-fund' }] },
        reimbursement
      )
    ).toThrow('INVALID_REIMBURSEMENT_VOUCHER');

    expect(() =>
      submitReplenishment(
        { ...state, vouchers: [{ ...voucher, status: 'REIMBURSED' }] },
        reimbursement
      )
    ).toThrow('INVALID_REIMBURSEMENT_VOUCHER');
  });

  it('restores cash and reimburses included vouchers only when disbursed', () => {
    const submitted = submitReplenishment(state, reimbursement);
    const approved = {
      ...submitted,
      reimbursements: submitted.reimbursements.map((item) => ({
        ...item,
        status: 'APPROVED' as const,
      })),
    };
    const next = disburseReplenishment(
      approved,
      reimbursement.id,
      '2026-10-21T10:00:00.000Z',
      'JV/202610/0001'
    );

    expect(next.funds[0].currentBalance).toBe(5_000_000);
    expect(next.funds[0].pendingReimburseAmount).toBe(0);
    expect(next.vouchers[0].status).toBe('REIMBURSED');
    expect(next.vouchers[0].reimbursementId).toBe(reimbursement.id);
    expect(next.reimbursements[0]).toMatchObject({
      status: 'DISBURSED',
      disbursedAt: '2026-10-21T10:00:00.000Z',
      journalEntryNumber: 'JV/202610/0001',
    });
  });

  it('does not restore cash twice when a disbursement is repeated', () => {
    const roomyState = { ...state, funds: [{ ...fund, pagu: 10_000_000 }] };
    const submitted = submitReplenishment(roomyState, reimbursement);
    const approved = {
      ...submitted,
      reimbursements: submitted.reimbursements.map((item) => ({
        ...item,
        status: 'APPROVED' as const,
      })),
    };
    const first = disburseReplenishment(
      approved,
      reimbursement.id,
      '2026-10-21T10:00:00.000Z',
      'JV/202610/0001'
    );
    const repeated = disburseReplenishment(
      first,
      reimbursement.id,
      '2026-10-21T10:05:00.000Z',
      'JV/202610/0002'
    );

    expect(first.funds[0].currentBalance).toBe(5_000_000);
    expect(repeated).toBe(first);
  });

  it('does not disburse a reimbursement that is still submitted', () => {
    const submitted = submitReplenishment(state, reimbursement);

    expect(disburseReplenishment(submitted, reimbursement.id, '2026-10-21T10:00:00.000Z')).toBe(
      submitted
    );
  });
});

describe('petty cash expense lifecycle', () => {
  it('records a paid voucher as physical cash accountability', () => {
    const paidVoucher = { ...voucher, id: 'voucher-2', status: 'PAID' as const, amount: 200_000 };

    const next = recordPaidVoucher(state, paidVoucher);

    expect(next.funds[0].currentBalance).toBe(3_600_000);
    expect(next.funds[0].pendingReimburseAmount).toBe(1_400_000);
    expect(next.vouchers[0]).toEqual(paidVoucher);
  });

  it('rejects a paid voucher above the available physical cash', () => {
    const oversizedVoucher = {
      ...voucher,
      id: 'voucher-2',
      status: 'PAID' as const,
      amount: 3_800_001,
    };

    expect(() => recordPaidVoucher(state, oversizedVoucher)).toThrow('INSUFFICIENT_CASH');
  });

  it('rejects transactions on a frozen fund', () => {
    const frozenState = { ...state, funds: [{ ...fund, status: 'FROZEN' as const }] };
    const paidVoucher = { ...voucher, id: 'voucher-2', status: 'PAID' as const, amount: 200_000 };

    expect(() => recordPaidVoucher(frozenState, paidVoucher)).toThrow('FUND_FROZEN');
    expect(() => submitReplenishment(frozenState, reimbursement)).toThrow('FUND_FROZEN');
  });
});

describe('petty cash fund routing', () => {
  it('does not substitute another fund for an unknown route id', () => {
    expect(findFundById(state.funds, 'missing-fund')).toBeUndefined();
  });
});
