export type PendingChangeType = 'FINE' | 'SALE_PAYMENT' | string;
export type PendingChangeStatus = 'PENDING' | 'APPROVED' | string;

export type PendingChangeFinePayload = {
  newLateFeeAmount?: number;
  syncDate?: string;
  [key: string]: any;
};

export type PendingChangePaymentPayload = {
  sale?: string;
  depositAccount?: string;
  paymentMethod?: string;
  paymentDate?: string;
  amount?: number;
  transactionNumber?: string;
  memo?: string | null;
  [key: string]: any;
};

export type PendingChangeItem = {
  id: string;
  site?: string;
  type: PendingChangeType;
  referenceModel: string;
  referenceId: string;
  payload: Record<string, any>;
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

export type PendingChangeListResponse = {
  data: PendingChangeItem[];
  pagination: PendingChangePagination;
};

export type PendingChangeCountResponse = {
  count: number;
};
