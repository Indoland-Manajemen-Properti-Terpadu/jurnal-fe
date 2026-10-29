import { post, get } from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';
import { notifications } from '@mantine/notifications';

export const getDraftAccount = async () => {
  const result = await get(`${API_ACCOUNT.GET_DRAFT_BALANCE}`);
  return result;
};

export const postDraftBalance = async (data: unknown) => {
  return post(API_ACCOUNT.POST_DRAFT_BALANCE, data);
};

export const postPublishDraftBalance = async (data: unknown) => {
  return post(`${API_ACCOUNT.POST_PUBLISH_DRAFT_BALANCE}`, data);
};

export const getDraftBalanceLogs = async () => {
  const result = await get(API_ACCOUNT.GET_DRAFT_BALANCE_LOGS);
  return result?.data || result;
};
