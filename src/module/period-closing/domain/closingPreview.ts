import { toMinor } from '@/lib/money/money';

/**
 * The closing journal the server is about to post, worked out from the trial balance so the user
 * sees it before confirming. Closing moves every revenue and expense balance to zero and puts the
 * difference (the net profit or loss) in retained earnings. The server computes the real journal;
 * this is a preview only and never sent.
 */

/** The part of a trial balance account the preview reads (matches the reports module's shape). */
export interface ClosingSourceAccount {
  id: string;
  accountNumber: string;
  name: string;
  /** Parent accounts already include their sub accounts, so they are skipped. */
  isHead: boolean;
  /** Profit and loss column of the trial balance; `null` for balance sheet accounts. */
  profitLoss: { debit: number | null; credit: number | null } | null;
}

export interface ClosingLine {
  accountId: string;
  accountNumber: string;
  name: string;
  /** Minor units; exactly one side is non-zero. */
  debit: number;
  credit: number;
}

export interface ClosingPreview {
  /** One line per revenue or expense account with a balance, reversing it. */
  lines: ClosingLine[];
  /** Revenue closed (credit balances), minor units. */
  totalRevenue: number;
  /** Expense closed (debit balances), minor units. */
  totalExpense: number;
  /** Revenue minus expense, minor units; negative is a loss. */
  netProfit: number;
}

const minor = (value: number | null | undefined): number => (value ? toMinor(value) : 0);

export const buildClosingPreview = (accounts: readonly ClosingSourceAccount[]): ClosingPreview => {
  let totalRevenue = 0;
  let totalExpense = 0;
  const lines: ClosingLine[] = [];

  accounts.forEach((account) => {
    if (account.isHead || !account.profitLoss) return;
    const balance = minor(account.profitLoss.debit) - minor(account.profitLoss.credit);
    if (balance === 0) return;

    if (balance > 0) totalExpense += balance;
    else totalRevenue += -balance;

    lines.push({
      accountId: account.id,
      accountNumber: account.accountNumber,
      name: account.name,
      // The closing line sits on the other side of the balance it clears.
      debit: balance < 0 ? -balance : 0,
      credit: balance > 0 ? balance : 0,
    });
  });

  return { lines, totalRevenue, totalExpense, netProfit: totalRevenue - totalExpense };
};
