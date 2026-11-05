export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PartyRef {
  id: string;
  name: string;
  /** Default payment term of the supplier, in days. */
  paymentTermDays: number | null;
  npwp: string | null;
}

export interface ProductRef {
  id: string;
  name: string;
  sku: string | null;
  unitName: string | null;
  isInventory: boolean;
}

export interface TaxRef {
  id: string;
  name: string;
  rate: number;
}

export interface PaymentMethodRef {
  id: string;
  name: string;
  adminFee: number;
  accountName: string | null;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
}

export type ApprovalMode = 'ANY' | 'ALL';

export interface ApprovalLevelProgress {
  level: number;
  name: string;
  mode: ApprovalMode;
  roles: { id: string; name: string; approved: boolean }[];
}

export interface ApprovalEntry {
  level: number;
  roleId: string;
  byId: string;
  at: string;
}

/** What the server says about a document's approval, including whether this user may decide now. */
export interface ApprovalState {
  /** Levels copied onto the document when it was submitted. */
  plan: { name: string; mode: ApprovalMode; roles: { id: string; name: string }[] }[];
  entries: ApprovalEntry[];
  /** Levels still waiting for a decision, with which roles already signed. */
  pending: ApprovalLevelProgress[];
  canDecide: boolean;
  rejectionReason: string | null;
  rejectedAt: string | null;
}

export interface DocumentBase {
  id: string;
  number: string;
  /** Date-only, `YYYY-MM-DD`. */
  date: string;
  memo: string;
  createdById: string;
  createdAt: string;
  attachments: Attachment[];
}
