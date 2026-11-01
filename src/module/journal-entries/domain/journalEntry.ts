/** A journal entry as the backend returns it, and the payload that creates one. */

export interface JournalSite {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JournalCategory {
  id?: string;
  categoryID?: string;
  name?: string;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JournalAttachment {
  id?: string;
  filePath?: string;
  fileName?: string;
  mimeType?: string;
  site?: JournalSite;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JournalLineAccount {
  id?: string;
  isLocked?: boolean;
  name?: string;
  type?: string;
  accountNumber?: string;
  isBankAndCash?: boolean;
  category?: JournalCategory;
  subAccount?: unknown[];
  amount?: number;
  draftAmount?: number;
  isPublished?: boolean;
  isAllUser?: boolean;
  level?: string;
  reconciliationDetail?: unknown[];
  journals?: unknown[];
  site?: JournalSite;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/** One debit or credit line of a journal entry (detail view). */
export interface JournalEntryLine {
  id?: string;
  account?: JournalLineAccount;
  transactionType?: string;
  transactionDate?: Date | string;
  description?: string;
  debit?: number;
  credit?: number;
  site?: JournalSite;
  deleted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  notes?: string;
}

/** `GET /v1/journal/detail/:id`. Several fields hold the string "-" when empty. */
export interface JournalEntryDetail {
  id?: string;
  transactionNumber?: string;
  transactionDate?: Date | string;
  transactionType?: string;
  transactionDetail?: JournalEntryLine[];
  attachments?: JournalAttachment[];
  tags?: string;
  site?: JournalSite;
  deleted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  notes?: string;
}

interface AccountEntryAccount {
  id: string;
  isLocked: boolean;
  name: string;
  accountNumber: string;
  category: string;
  subAccount: unknown[];
  draftAmount: number;
  isPublished: boolean;
  isAllUser: boolean;
  level: string;
  reconciliationDetail: unknown[];
  journals: unknown[];
  site: JournalSite;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountEntryLine {
  id: string;
  account: AccountEntryAccount;
  description: string;
  debit: number;
  credit: number;
  site: JournalSite;
  createdAt: string;
  updatedAt: string;
}

/** One journal entry in the list of an account (`GET /v1/journal/account/:id`). */
export interface JournalEntryByAccount {
  id: string;
  transactionNumber: number;
  transactionDate: Date;
  transactionDetail: AccountEntryLine[];
  status: string;
  amount: number;
  credit: number;
  debit: number;
  balance: number;
  attachments: unknown[];
  notes: string;
  site: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryLinePayload {
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalEntryPayload {
  transactionNumber?: number;
  transactionDate: string;
  transactionDetail: JournalEntryLinePayload[];
  notes: string;
  attachments: File[];
  tags: string[];
}

/** A row of the entry form before it is saved. Amounts are numbers rounded to the cent. */
export interface DraftLine {
  account: string;
  description: string;
  debit: number;
  credit: number;
  key: string;
}

export interface Tag {
  id: string;
  site: string;
  name: string;
  color: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TagsResponse {
  code: number;
  message: string;
  data: {
    data: Tag[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  };
}
