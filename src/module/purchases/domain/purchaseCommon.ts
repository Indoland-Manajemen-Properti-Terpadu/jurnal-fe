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
  unitId: string | null;
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

/** A payment term the user can pick on a quote; the mechanism decides which overrides apply. */
export interface PaymentTermOption {
  id: string;
  name: string;
  days: number;
  advanceType: 'none' | 'partial' | 'full';
  billingSplit: 'single' | 'milestone' | 'recurring';
  hasDueTerm: boolean;
  hasRetention: boolean;
  defaultAdvancePercent: number | null;
  defaultInstallments: number | null;
  defaultPeriods: number | null;
  defaultDueDays: number | null;
  defaultRetentionPercent: number | null;
  defaultMaintenanceMonths: number | null;
  /** The service's ready-made sentence of the term, e.g. "Uang muka 30%". */
  paymentLabel: string;
  billingLabel: string;
  dueLabel: string;
  isActive: boolean;
}

/** What a bill file is: the vendor's invoice, the tax invoice, or any other file. */
export type AttachmentKind = 'VENDOR_INVOICE' | 'TAX_INVOICE' | 'OTHER';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  /** Only bill files carry a kind; the others are `OTHER`. */
  kind: AttachmentKind;
  /** The service's own label ("Invoice vendor"); empty when it sent none. */
  kindLabel: string;
}

export interface NamedRef {
  id: string;
  name: string;
}

/** A person as the server describes them on a document. */
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  title: string;
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
  note?: string;
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
