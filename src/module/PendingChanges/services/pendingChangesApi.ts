import apiClient from '@/lib/http/apiClient';
import { API_PENDING_CHANGES } from '@/services/endpoint';
import type {
  PendingChangeItem,
  PendingChangeListParams,
  PendingChangeListResponse,
} from '../types/pendingChange';

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export const fetchPendingChanges = async (
  params?: PendingChangeListParams
): Promise<PendingChangeListResponse> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.type) query.append('type', params.type);
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const url = `${API_PENDING_CHANGES.GET_ALL}${query.toString() ? `?${query.toString()}` : ''}`;
  const { data } = await apiClient.get<ApiEnvelope<PendingChangeListResponse | PendingChangeItem[]>>(url);

  // If response is nested or array
  const raw = data.data;
  if (raw && 'data' in raw && Array.isArray(raw.data)) {
    return raw as PendingChangeListResponse;
  }

  if (Array.isArray(raw)) {
    return {
      data: raw,
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
  const { data } = await apiClient.get<ApiEnvelope<{ count?: number }>>(
    API_PENDING_CHANGES.GET_COUNT
  );
  return Number(data.data?.count) || 0;
};

export const approvePendingChange = async (changeId: string): Promise<any> => {
  const { data } = await apiClient.put<ApiEnvelope<any>>(
    API_PENDING_CHANGES.APPROVE_CHANGE(changeId)
  );
  return data.data;
};

export const approveAllPendingChanges = async (type?: string): Promise<any> => {
  const payload = type ? { type } : {};
  const { data } = await apiClient.put<ApiEnvelope<any>>(
    API_PENDING_CHANGES.APPROVE_ALL,
    payload
  );
  return data.data;
};

