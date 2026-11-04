import { sumMinor, toMinor } from '@/lib/money/money';
import type {
  AccountRef,
  FundBalance,
  FundPocket,
  VoucherLine,
} from '@/module/petty-cash/domain/pettyCashEntities';

export type VarianceKind = 'SHORT' | 'OVER' | 'NONE';

/**
 * `unsettledVariance` is signed by the server (negative is a shortage). A shortage is part of what
 * the fund still has to account for, and it is refilled with the next reimbursement.
 */
export const varianceView = (unsettledVariance: number): { kind: VarianceKind; amount: number } => {
  if (unsettledVariance < 0) return { kind: 'SHORT', amount: Math.abs(unsettledVariance) };
  if (unsettledVariance > 0) return { kind: 'OVER', amount: unsettledVariance };
  return { kind: 'NONE', amount: 0 };
};

const sumAmounts = (values: number[]) => sumMinor(values.map((value) => toMinor(value))) / 100;

/**
 * Net and tax of a voucher as the server builds them (tax is added on top of each net line amount).
 * `reconciles` is false when net plus tax does not equal the server's total (for example a future
 * discount); the screen then shows only the server total instead of a breakdown that disagrees.
 */
export const voucherBreakdown = (lines: VoucherLine[], totalAmount: number) => {
  const net = sumAmounts(lines.map((line) => line.amount));
  const tax = sumAmounts(lines.map((line) => line.taxAmount));
  return { net, tax, reconciles: sumAmounts([net, tax]) === totalAmount };
};

/**
 * First expense account of a voucher and how many other distinct accounts it also hits. List items
 * carry only account ids, so `resolve` (for example the lookups) supplies the name.
 */
export const summarizeVoucherAccounts = (
  lines: VoucherLine[],
  resolve: (accountId: string) => AccountRef | undefined = () => undefined
): { first: AccountRef | null; extra: number } => {
  const distinct = new Set(lines.map((line) => line.expenseAccountId));
  const [firstLine] = lines;
  return {
    first: firstLine
      ? (firstLine.expenseAccount ?? resolve(firstLine.expenseAccountId) ?? null)
      : null,
    extra: Math.max(distinct.size - 1, 0),
  };
};

const CASH_BOOK_TYPES = [
  'FUNDING',
  'VOUCHER',
  'VOUCHER_VOID',
  'VARIANCE_ADJUSTMENT',
  'REPLENISHMENT',
  'ADVANCE',
  'ADVANCE_RETURN',
  'ADVANCE_EXTRA',
  'ADVANCE_RECEIVABLE',
  'POCKET_TRANSFER',
] as const;

export type CashBookTypeKey = (typeof CASH_BOOK_TYPES)[number] | 'OTHER';

/** Entry types seen so far; anything else gets a neutral label instead of a raw code. */
export const cashBookTypeKey = (type: string): CashBookTypeKey =>
  (CASH_BOOK_TYPES as readonly string[]).includes(type) ? (type as CashBookTypeKey) : 'OTHER';

export type ImprestRowKey = 'cash' | 'pendingVouchers' | 'advances' | 'shortage' | 'surplus';

/**
 * The rows of the imprest equation `pagu = cash + vouchers + advances - unsettledVariance`, each
 * with the sign it carries in the sum, so the rows shown always add up to the ceiling when the
 * server says the fund is balanced. A shortage is an addend; a surplus is a deduction.
 */
export const imprestEquation = (
  balance: FundBalance
): Array<{ key: ImprestRowKey; amount: number }> => {
  const variance = varianceView(balance.unsettledVariance);
  const rows: Array<{ key: ImprestRowKey; amount: number }> = [
    { key: 'cash', amount: balance.cashBalance },
    { key: 'pendingVouchers', amount: balance.pendingVoucherAmount },
    { key: 'advances', amount: balance.outstandingAdvanceAmount },
  ];
  if (variance.kind === 'SHORT') rows.push({ key: 'shortage', amount: variance.amount });
  if (variance.kind === 'OVER') rows.push({ key: 'surplus', amount: -variance.amount });
  return rows;
};

/** Pockets that can take part in a transaction; an inactive one stays visible but is not offered. */
export const activePockets = (pockets: FundPocket[]) => pockets.filter((pocket) => pocket.isActive);

/** The pocket balances should add up to the fund's cash balance; a gap means the data disagrees. */
export const pocketsMatchCash = (pockets: FundPocket[], cashBalance: number) =>
  pockets.length === 0 || sumAmounts(pockets.map((pocket) => pocket.balance)) === cashBalance;

const OBJECT_ID = /^[0-9a-f]{24}$/i;

/** Backend ids are 24-hex ObjectIds; anything else is a 400 there, so it is rejected before the call. */
export const isValidObjectId = (value: string | undefined): value is string =>
  value !== undefined && OBJECT_ID.test(value);
