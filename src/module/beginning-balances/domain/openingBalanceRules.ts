import { canPublishOpeningBalance } from '@/lib/accounting/journalBalance';
import { isDebitNormal } from '@/lib/accounting/normalBalance';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import type { BalanceState, DraftBalanceEntry } from './beginningBalance';

type OpeningRow = { debit?: unknown; credit?: unknown };

/** Opening balance totals as the page shows them; the publish gate needs equal totals above zero. */
export const summarizeOpeningBalance = (rows: OpeningRow[]) => {
  const sumDebit = rows.reduce((sum, acc) => sum + (Number(acc.debit) || 0), 0);
  const sumCredit = rows.reduce((sum, acc) => sum + (Number(acc.credit) || 0), 0);
  return {
    totalDebit: sumDebit,
    totalCredit: sumCredit,
    difference: Math.abs(sumDebit - sumCredit),
    isBalanced: canPublishOpeningBalance([{ debit: sumDebit, credit: sumCredit }]),
  };
};

/** Pre-publish validation order: empty first, then unbalanced, otherwise ready. */
export const checkOpeningPublish = (
  totalDebit: number,
  totalCredit: number
): 'empty' | 'unbalanced' | 'ready' => {
  if (totalDebit === 0 && totalCredit === 0) return 'empty';
  if (totalDebit !== totalCredit) return 'unbalanced';
  return 'ready';
};

export const getBalanceState = (
  totalDebit: number,
  totalCredit: number,
  isBalanced: boolean
): BalanceState => {
  if (isBalanced) return 'balanced';
  return totalDebit === 0 && totalCredit === 0 ? 'empty' : 'unbalanced';
};

/** Determine normal balance position from category standard. */
export function isNormalDebit(categoryName?: string, isDebit?: boolean): boolean {
  return isDebitNormal({ isDebit, categoryName });
}

export const accountKey = (acc: JournalAccounts): string =>
  acc.id || (acc as { _id?: string })._id || '';

/** Overlay saved draft amounts on the account list; accounts without a draft line keep their own. */
export const mergeDraftIntoAccounts = (
  accounts: JournalAccounts[],
  entries: DraftBalanceEntry[]
): JournalAccounts[] =>
  accounts.map((acc) => {
    const accId = accountKey(acc);
    const matched = entries.find(
      (d) =>
        d._id === accId ||
        d.id === accId ||
        d.accounts === accId ||
        (typeof d.accounts === 'object' &&
          d.accounts !== null &&
          (d.accounts.id === accId || d.accounts._id === accId))
    );
    return {
      ...acc,
      debit: matched?.debit !== undefined ? Number(matched.debit) : Number(acc.debit) || 0,
      credit: matched?.credit !== undefined ? Number(matched.credit) : Number(acc.credit) || 0,
    };
  });

/** Integer-only entry: every non digit is dropped; entering a positive value clears the other side. */
export const applyAmountEntry = (
  rows: JournalAccounts[],
  accountId: string,
  field: 'debit' | 'credit',
  raw: string
): JournalAccounts[] => {
  const digits = raw.replace(/\D/g, '');
  const value = digits ? parseInt(digits, 10) : 0;
  const opposite = field === 'debit' ? 'credit' : 'debit';
  return rows.map((acc) =>
    accountKey(acc) === accountId
      ? { ...acc, [field]: value, [opposite]: value > 0 ? 0 : acc[opposite] || 0 }
      : acc
  );
};

export const clearAccountRow = (rows: JournalAccounts[], accountId: string): JournalAccounts[] =>
  rows.map((acc) => (accountKey(acc) === accountId ? { ...acc, debit: 0, credit: 0 } : acc));

/** Payload keys `account`/`accounts` and `balances`/`accounts` are duplicated for backend compatibility. */
export const buildBalancePayload = (rows: JournalAccounts[], period: string) => {
  const balances = rows.map((acc) => {
    const accId = accountKey(acc);
    return {
      account: accId,
      accounts: accId,
      debit: Number(acc.debit) || 0,
      credit: Number(acc.credit) || 0,
    };
  });
  return { period, balances, accounts: balances };
};
