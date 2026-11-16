export type JournalAccounts = {
  id: string;
  isLocked?: string;
  name: string;
  type?: string;
  accountNumber?: string;
  category?: Category;
  subAccount?: JournalAccounts[];
  isBankAndCash?: boolean;
  isHead?: boolean;
  isPostable?: boolean;
  amount: number;
  debit: number | 0;
  credit: number | 0;
  defaultTax?: DefaultTax | null;
  isAllUser?: boolean;
  isArchived?: boolean;
  /** Set by the backend when the account is linked to a bank (docs/prd/bank-connection.md, 7.5). */
  bankConnection?: AccountBankConnection | null;
  level?: string;
  reconciliationDetail?: unknown[];
  journals?: unknown[];
  site?: Site;
  createdAt?: Date;
  updatedAt?: Date;
};

/** The light summary of a bank connection carried by an account of the list. */
export type AccountBankConnection = {
  id: string;
  status: string;
  bankName?: string;
  lastSyncedAt?: string;
  /** Bank balance in rupiah, as the bank reported it. */
  statementBalance?: number;
  statementBalanceAsOf?: string;
};

/** Default tax as the list and detail endpoints populate it. */
export type DefaultTax = {
  id: string;
  name: string;
  rate?: number;
  taxCode?: string;
};

export type Category = {
  id?: string;
  categoryID?: string;
  name?: string;
  isDebit?: boolean;
  deleted?: boolean;
};

export type Site = {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
