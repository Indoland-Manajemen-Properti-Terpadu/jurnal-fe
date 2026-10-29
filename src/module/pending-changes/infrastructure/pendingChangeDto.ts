import type { PendingChangePagination } from '../domain/pendingChange';

export type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export type PendingChangeDto = {
  id: string;
  site?: string;
  type: string;
  referenceModel: string;
  referenceId: string;
  payload?: Record<string, unknown> | null;
  notes?: string;
  status: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PendingChangeListDto = {
  data: PendingChangeDto[];
  pagination: PendingChangePagination;
};

export type PendingChangeCountDto = {
  count?: number;
};
