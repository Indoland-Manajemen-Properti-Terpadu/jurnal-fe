export interface DepositSourceAccount {
  id: string;
  name: string;
  accountNumber?: string;
  isBankAndCash?: boolean;
  isArchived?: boolean;
  subAccount?: DepositSourceAccount[];
}

export interface DepositOption {
  value: string;
  label: string;
}

const toOption = (account: DepositSourceAccount): DepositOption => ({
  value: account.id,
  label: `${account.accountNumber || ''} - ${account.name}`,
});

const isUsable = (account: DepositSourceAccount) =>
  Boolean(account.isBankAndCash) && !account.isArchived;

/**
 * Where a payment can be deposited: cash and bank accounts only. A header account groups its
 * sub-accounts and is never posted to, so its usable sub-accounts (at any depth) are offered
 * instead of it.
 */
export const depositAccountOptions = (accounts: DepositSourceAccount[]): DepositOption[] =>
  accounts.flatMap((account) => {
    const subs = account.subAccount ?? [];
    if (subs.length > 0) return depositAccountOptions(subs);
    return isUsable(account) ? [toOption(account)] : [];
  });
