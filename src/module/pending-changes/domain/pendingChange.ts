export const PENDING_CHANGE_TYPES = {
  fine: 'FINE',
  salePayment: 'SALE_PAYMENT',
} as const;

export const PENDING_CHANGE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export type PendingChangeStatus = (typeof PENDING_CHANGE_STATUSES)[number];

/** The API sends further type names (for example void or delete types), so the type stays a string. */
export type PendingChangeType = string;

export type PendingChangeAmount = number | string | null;

export type PendingChangePayload = {
  newLateFeeAmount?: PendingChangeAmount;
  amount?: PendingChangeAmount;
  nominal?: PendingChangeAmount;
  total?: PendingChangeAmount;
  originalAmount?: PendingChangeAmount;
  paymentMethod?: string;
  transactionNumber?: string;
  description?: string;
  note?: string;
  reason?: string;
  action?: string;
  [key: string]: unknown;
};

export type PendingChangeItem = {
  id: string;
  site?: string;
  type: PendingChangeType;
  referenceModel: string;
  referenceId: string;
  payload: PendingChangePayload;
  notes?: string;
  status: PendingChangeStatus;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PendingChangeListParams = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
};

export type PendingChangePagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PendingChangeListResult = {
  data: PendingChangeItem[];
  pagination: PendingChangePagination;
};
