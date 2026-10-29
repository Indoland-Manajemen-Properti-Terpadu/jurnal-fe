import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_PENDING_CHANGES } from '@/services/endpoint';
import type { PendingChangeListParams, PendingChangeListResult } from '../domain/pendingChange';
import type {
  ApiEnvelope,
  PendingChangeCountDto,
  PendingChangeDto,
  PendingChangeListDto,
} from './pendingChangeDto';
import { toPendingChange, toPendingChangeList } from './pendingChangeMapper';

export const fetchPendingChanges = async (
  params?: PendingChangeListParams
): Promise<PendingChangeListResult> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.type) query.append('type', params.type);
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const url = `${API_PENDING_CHANGES.GET_ALL}${query.toString() ? `?${query.toString()}` : ''}`;
  const { data } = await apiClient.get<ApiEnvelope<PendingChangeListDto | PendingChangeDto[]>>(url);

  // The API answers either with { data, pagination } or with a bare array.
  const raw = data.data;
  if (raw && 'data' in raw && Array.isArray(raw.data)) {
    return toPendingChangeList(raw);
  }

  if (Array.isArray(raw)) {
    return {
      data: raw.map(toPendingChange),
      pagination: {
        total: raw.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      },
    };
  }

  return {
    data: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
};

export const fetchPendingChangesCount = async (): Promise<number> => {
  const { data } = await apiClient.get<ApiEnvelope<PendingChangeCountDto>>(
    API_PENDING_CHANGES.GET_COUNT
  );
  return Number(data.data?.count) || 0;
};

export const approvePendingChange = async (changeId: string): Promise<unknown> => {
  const { data } = await apiClient.put<ApiEnvelope<unknown>>(
    API_PENDING_CHANGES.APPROVE_CHANGE(changeId)
  );
  return data.data;
};

export const approveAllPendingChanges = async (type?: string): Promise<unknown> => {
  const payload = type ? { type } : {};
  const { data } = await apiClient.put<ApiEnvelope<unknown>>(
    API_PENDING_CHANGES.APPROVE_ALL,
    payload
  );
  return data.data;
};

/** The message the API put in the error response, when there is one. */
export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  const message: unknown = error.response?.data?.message;
  return typeof message === 'string' && message ? message : undefined;
};
