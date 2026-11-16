import type { JournalAccounts, SimpleAccount } from '@/module/chart-of-accounts';
import type { PettyCashFund } from '@/module/petty-cash';

/** A postable Cash & Bank account with the name of the cash header it sits under, if any. */
export type CashBankAccount = JournalAccounts & { groupName: string | null };

const isHeader = (account: JournalAccounts): boolean =>
  account.isHead === true || account.isPostable === false;

/**
 * `GET /v1/accounts` is a tree: a header carries its children in `subAccount` and its own `amount`
 * is their sum. Walk the tree, keep the postable accounts flagged Cash & Bank and drop headers, so a
 * balance is never counted twice. A header only names the group of its children.
 */
export const flattenCashBankAccounts = (accounts: JournalAccounts[]): CashBankAccount[] => {
  const seen = new Set<string>();
  const result: CashBankAccount[] = [];

  const walk = (list: JournalAccounts[] | undefined, groupName: string | null) => {
    (list ?? []).forEach((account) => {
      const header = isHeader(account);
      if (!header && account.isBankAndCash && !seen.has(account.id)) {
        seen.add(account.id);
        result.push({ ...account, groupName });
      }
      const nextGroup = header && account.isBankAndCash ? account.name : header ? null : groupName;
      walk(account.subAccount, nextGroup);
    });
  };

  walk(accounts, null);
  return result;
};

/** The fund a ledger account belongs to, keyed by the ledger account id. */
export type PettyCashAccountIndex = Map<string, { fundId: string; fundName: string }>;

type FundAccountRef = Pick<PettyCashFund, 'id' | 'name' | 'status'> & {
  account: { id: string };
};

/** A closed fund frees its account; an inactive one still owns it. */
export const pettyCashAccountIndex = (funds: FundAccountRef[]): PettyCashAccountIndex =>
  new Map(
    funds
      .filter((fund) => fund.status !== 'CLOSED')
      .map((fund) => [fund.account.id, { fundId: fund.id, fundName: fund.name }])
  );

export type TransactionBlock = 'archived' | 'pettyCash' | null;

/** Why a plain receive, send or transfer is not offered for the account; archived wins. */
export const transactionBlock = (
  account: Pick<JournalAccounts, 'id' | 'isArchived'>,
  index: PettyCashAccountIndex
): TransactionBlock => {
  if (account.isArchived) return 'archived';
  return index.has(account.id) ? 'pettyCash' : null;
};

/**
 * The cash and bank accounts a posting form offers: the list comes from the simple accounts
 * endpoint (the server decides which accounts may take a transaction), the balance from the tree.
 */
export const cashBankOptions = (
  offered: Pick<SimpleAccount, 'id' | 'name' | 'accountNumber'>[],
  tree: JournalAccounts[]
): JournalAccounts[] => {
  const byId = new Map(flattenCashBankAccounts(tree).map((account) => [account.id, account]));
  return offered.map(
    (account) =>
      byId.get(account.id) ??
      ({ ...account, amount: 0, debit: 0, credit: 0, isBankAndCash: true } as JournalAccounts)
  );
};
