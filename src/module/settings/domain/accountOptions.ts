export interface AccountOption {
  value: string;
  label: string;
}

export interface AccountLike {
  id?: string;
  accountNumber?: string;
  name?: string;
  type?: string;
  category?: { name?: string };
  isBankAndCash?: boolean;
  subAccount?: AccountLike[];
}

/**
 * Flattens chart-of-accounts trees (including nested `subAccount` children) into select options.
 * First of a duplicate id wins; entries without an id are skipped.
 */
export const buildAccountOptions = (
  accounts: unknown[],
  suffixOf: (account: AccountLike) => string = () => ''
): AccountOption[] => {
  const options = new Map<string, AccountOption>();

  const visit = (entries: unknown[], inherited?: Pick<AccountLike, 'type' | 'category'>) => {
    entries.forEach((entry) => {
      const raw = entry as AccountLike | null;
      if (!raw) return;
      const account: AccountLike = {
        ...raw,
        type: raw.type ?? inherited?.type,
        category: raw.category ?? inherited?.category,
      };
      if (account.id && !options.has(account.id)) {
        options.set(account.id, {
          value: account.id,
          label: `${account.accountNumber ? `${account.accountNumber} - ` : ''}${account.name}${suffixOf(account)}`,
        });
      }
      if (Array.isArray(raw.subAccount) && raw.subAccount.length > 0) {
        visit(raw.subAccount, { type: account.type, category: account.category });
      }
    });
  };

  visit(accounts);
  return Array.from(options.values());
};
