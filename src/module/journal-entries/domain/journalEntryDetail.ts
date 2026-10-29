export interface TransactionDetailModel {
  id?: string;
  transactionNumber?: string | '-';
  transactionDate?: Date | string | '-';
  transactionType?: string;
  transactionDetail?: TransactionDetail[];
  attachments?: Attachment[];
  tags?: string | '-';
  site?: Site;
  deleted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  notes?: string | '-';
}

export interface Attachment {
  id?: string;
  filePath?: string | undefined;
  fileName?: string | undefined;
  mimeType?: string | undefined;
  site?: Site;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Site {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionDetail {
  id?: string;
  account?: Account;
  transactionType?: string;
  transactionDate?: Date | string | '-';
  description?: string | '-';
  debit?: number;
  site?: Site;
  deleted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  credit?: number;
  notes?: string | '-';
}

export interface Account {
  id?: string;
  isLocked?: boolean;
  name?: string;
  type?: string;
  accountNumber?: string;
  isBankAndCash?: boolean;
  category?: Category;
  subAccount?: any[];
  amount?: number;
  draftAmount?: number;
  isPublished?: boolean;
  isAllUser?: boolean;
  level?: string;
  reconciliationDetail?: any[];
  journals?: any[];
  site?: Site;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id?: string | undefined;
  categoryID?: string | undefined;
  name?: string | undefined;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
