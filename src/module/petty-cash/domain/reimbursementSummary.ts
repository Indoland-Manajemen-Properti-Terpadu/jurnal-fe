import { sumAmounts } from './pettyCashMoney';

export interface ReimbursementLine {
  code: string;
  name: string;
  amount: number;
}

interface VoucherLike {
  amount: number;
  expenseAccount: { code: string; name: string };
}

/** Total of the selected vouchers and their amounts grouped by expense account, all to the cent. */
export const summarizeReimbursement = (
  vouchers: VoucherLike[]
): { total: number; breakdown: ReimbursementLine[] } => {
  const groups = new Map<string, { code: string; name: string; amounts: number[] }>();
  vouchers.forEach((voucher) => {
    const { code, name } = voucher.expenseAccount;
    const group = groups.get(code) ?? { code, name, amounts: [] };
    group.amounts.push(voucher.amount);
    groups.set(code, group);
  });

  return {
    total: sumAmounts(vouchers.map((voucher) => voucher.amount)),
    breakdown: Array.from(groups.values()).map(({ code, name, amounts }) => ({
      code,
      name,
      amount: sumAmounts(amounts),
    })),
  };
};
