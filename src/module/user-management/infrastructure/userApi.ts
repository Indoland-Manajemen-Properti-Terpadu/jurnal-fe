import apiClient from '@/lib/http/apiClient';
import { API_USERS } from '@/lib/http/endpoints';
import type { AllUserModel, UserDetail } from '@/module/user-management/domain/userTypes';

// The default client rejects on an HTTP error, so the queries report `isError`.

export const fetchUsers = async (): Promise<AllUserModel> =>
  (await apiClient.get<AllUserModel>(API_USERS.GET_ALL_USER)).data;

export const fetchUserByEmail = async (email: string): Promise<UserDetail> =>
  (await apiClient.get<UserDetail>(API_USERS.GET_USER_DETAIL, { params: { payload: { email } } }))
    .data;
