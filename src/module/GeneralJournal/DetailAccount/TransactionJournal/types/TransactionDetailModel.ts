export interface TransactionDetailModel {
  id?: string;
  transactionNumber?: string | '-';
  transactionDate?: Date | '-';
  transactionDetail?: TransactionDetail[];
  attachments?: Attachment[];
  tags?: string | '-';
  site?: Site;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
  description?: string | '-';
  debit?: number;
  site?: Site;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  credit?: number;
  notes?: string | '-';
}

export interface Account {
  id?: string;
  isLocked?: boolean;
  name?: string;
  type?: string;
  accountNumber?: string;
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
