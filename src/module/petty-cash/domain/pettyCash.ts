import type {
  PettyCashCount,
  PettyCashFund,
  PettyCashReimbursement,
  PettyCashVoucher,
} from '@/module/petty-cash/domain/pettyCash.types';

export interface PettyCashPrototypeState {
  funds: PettyCashFund[];
  vouchers: PettyCashVoucher[];
  reimbursements: PettyCashReimbursement[];
  cashCounts: PettyCashCount[];
}

export const findFundById = (funds: PettyCashFund[], fundId: string | undefined) =>
  funds.find((fund) => fund.id === fundId);

export function recordPaidVoucher(
  state: PettyCashPrototypeState,
  voucher: PettyCashVoucher
): PettyCashPrototypeState {
  const fund = state.funds.find((item) => item.id === voucher.fundId);
  if (!fund) throw new Error('FUND_NOT_FOUND');
  if (fund.status === 'FROZEN') throw new Error('FUND_FROZEN');
  if (voucher.amount > fund.currentBalance) throw new Error('INSUFFICIENT_CASH');

  return {
    ...state,
    vouchers: [voucher, ...state.vouchers],
    funds: state.funds.map((item) => {
      if (item.id !== voucher.fundId) return item;
      const currentBalance = item.currentBalance - voucher.amount;
      return {
        ...item,
        currentBalance,
        pendingReimburseAmount: item.pendingReimburseAmount + voucher.amount,
        status: currentBalance <= item.minThresholdAlert ? 'LOW_BALANCE' : 'ACTIVE',
      };
    }),
  };
}

export function submitReplenishment(
  state: PettyCashPrototypeState,
  reimbursement: PettyCashReimbursement
): PettyCashPrototypeState {
  const fund = state.funds.find((item) => item.id === reimbursement.fundId);
  if (!fund) throw new Error('FUND_NOT_FOUND');
  if (fund.status === 'FROZEN') throw new Error('FUND_FROZEN');
  const eligibleVouchers = state.vouchers.filter(
    (voucher) =>
      reimbursement.voucherIds.includes(voucher.id) &&
      voucher.fundId === reimbursement.fundId &&
      ['PAID', 'PENDING_REIMBURSE'].includes(voucher.status)
  );
  if (eligibleVouchers.length !== reimbursement.voucherIds.length) {
    throw new Error('INVALID_REIMBURSEMENT_VOUCHER');
  }
  const voucherTotal = eligibleVouchers.reduce((total, voucher) => total + voucher.amount, 0);
  if (voucherTotal !== reimbursement.totalAmount) {
    throw new Error('REIMBURSEMENT_TOTAL_MISMATCH');
  }

  return {
    ...state,
    reimbursements: [reimbursement, ...state.reimbursements],
    vouchers: state.vouchers.map((voucher) =>
      reimbursement.voucherIds.includes(voucher.id)
        ? {
            ...voucher,
            status: 'REIMBURSEMENT_PENDING',
            reimbursementId: reimbursement.id,
            reimbursementNumber: reimbursement.reimbursementNumber,
          }
        : voucher
    ),
  };
}

export function disburseReplenishment(
  state: PettyCashPrototypeState,
  reimbursementId: string,
  disbursedAt: string,
  journalEntryNumber?: string
): PettyCashPrototypeState {
  const reimbursement = state.reimbursements.find((item) => item.id === reimbursementId);
  if (!reimbursement || reimbursement.status !== 'APPROVED') return state;

  return {
    ...state,
    reimbursements: state.reimbursements.map((item) =>
      item.id === reimbursementId
        ? { ...item, status: 'DISBURSED', disbursedAt, journalEntryNumber }
        : item
    ),
    vouchers: state.vouchers.map((voucher) =>
      reimbursement.voucherIds.includes(voucher.id)
        ? {
            ...voucher,
            status: 'REIMBURSED',
            reimbursementId: reimbursement.id,
            reimbursementNumber: reimbursement.reimbursementNumber,
          }
        : voucher
    ),
    funds: state.funds.map((fund) => {
      if (fund.id !== reimbursement.fundId) return fund;

      const currentBalance = Math.min(fund.pagu, fund.currentBalance + reimbursement.totalAmount);
      return {
        ...fund,
        currentBalance,
        pendingReimburseAmount: Math.max(
          0,
          fund.pendingReimburseAmount - reimbursement.totalAmount
        ),
        status: currentBalance <= fund.minThresholdAlert ? 'LOW_BALANCE' : 'ACTIVE',
      };
    }),
  };
}
