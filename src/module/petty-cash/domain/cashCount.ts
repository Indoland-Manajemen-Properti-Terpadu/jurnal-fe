import { addAmounts, sumAmounts, subtractAmounts, compareAmounts } from './pettyCashMoney';
import type { CashCountStatus, VoucherStatus } from './pettyCashTypes';

/** Vouchers that still count towards the fund ceiling until the reimbursement is paid out. */
const UNREIMBURSED: VoucherStatus[] = ['PENDING_REIMBURSE', 'PAID', 'REIMBURSEMENT_PENDING'];

export interface CashCountInput {
  fundId: string | undefined;
  pagu: number;
  denominations: readonly number[];
  counts: Record<number, number>;
  vouchers: Array<{ fundId: string; amount: number; status: VoucherStatus }>;
}

export interface CashCountResult {
  totalPhysicalCash: number;
  totalUnreimbursedVouchers: number;
  actualTotal: number;
  variance: number;
  status: CashCountStatus;
}

/** Imprest check: cash in hand plus unreimbursed vouchers against the fund ceiling, to the cent. */
export const calculateCashCount = ({
  fundId,
  pagu,
  denominations,
  counts,
  vouchers,
}: CashCountInput): CashCountResult => {
  const totalPhysicalCash = sumAmounts(denominations.map((value) => value * (counts[value] || 0)));
  const totalUnreimbursedVouchers = sumAmounts(
    vouchers
      .filter((voucher) => voucher.fundId === fundId && UNREIMBURSED.includes(voucher.status))
      .map((voucher) => voucher.amount)
  );
  const actualTotal = addAmounts(totalPhysicalCash, totalUnreimbursedVouchers);
  const variance = subtractAmounts(actualTotal, pagu);
  const difference = compareAmounts(actualTotal, pagu);

  return {
    totalPhysicalCash,
    totalUnreimbursedVouchers,
    actualTotal,
    variance,
    status: difference === 0 ? 'BALANCED' : difference < 0 ? 'SHORT' : 'OVER',
  };
};
