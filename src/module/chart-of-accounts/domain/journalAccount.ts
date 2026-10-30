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
  tax?: number | '-';
  isAllUser?: boolean;
  isArchived?: boolean;
  level?: string;
  reconciliationDetail?: unknown[];
  journals?: unknown[];
  site?: Site;
  createdAt?: Date;
  updatedAt?: Date;
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
