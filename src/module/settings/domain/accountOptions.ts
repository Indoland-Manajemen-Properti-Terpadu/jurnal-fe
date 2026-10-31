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
}

/** Select options of the accounts: first of a duplicate id wins, entries without an id are skipped. */
export const buildAccountOptions = (
  accounts: unknown[],
  suffixOf: (account: AccountLike) => string = () => ''
): AccountOption[] => {
  const options = new Map<string, AccountOption>();
  accounts.forEach((entry) => {
    const account = entry as AccountLike | null;
    if (!account?.id || options.has(account.id)) return;
    options.set(account.id, {
      value: account.id,
      label: `${account.accountNumber ? `${account.accountNumber} - ` : ''}${account.name}${suffixOf(account)}`,
    });
  });
  return Array.from(options.values());
};
