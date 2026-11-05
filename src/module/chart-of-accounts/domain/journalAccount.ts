export type JournalAccounts = {
  id: string;
  isLocked?: string;
  name: string;
  type?: string;
  accountNumber?: string;
  category?: Category;
  subAccount?: JournalAccounts[];
  isBankAndCash?: boolean;
  amount: number;
  debit: number | 0;
  credit: number | 0;
  defaultTax?: DefaultTax | null;
  isAllUser?: boolean;
  isArchived?: boolean;
  level?: string;
  reconciliationDetail?: unknown[];
  journals?: unknown[];
  site?: Site;
  createdAt?: Date;
  updatedAt?: Date;
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
