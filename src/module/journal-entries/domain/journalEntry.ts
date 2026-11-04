import type { RawJournalTags } from './journalTags';
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
  tags?: RawJournalTags;
  /** `ACTIVE`, `VOID` (cancelled) or `REVERSAL` (the entry that cancelled another). */
  status?: string;
  /** Whether the server lets this entry be voided; an edit is a void plus a new entry. */
  canVoid?: boolean;
  /** Why it cannot be voided (a petty cash entry, one that is already void, ...). */
  voidBlockedReason?: string | null;
  /** Id of the reversal entry, for a void entry. */
  reversedBy?: string | null;
  /** Id of the entry this one reverses, for a reversal entry. */
  reverses?: string | null;
  sourceType?: string | null;
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
  /** Whether the server allows a void, and why not (`voidBlockedReason`). */
  canVoid?: boolean;
  voidBlockedReason?: string | null;
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
