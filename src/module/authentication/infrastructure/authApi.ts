import apiClient from '@/lib/http/apiClient';
import { API_AUTH } from '@/lib/http/endpoints';
import type { LoginModelResponse } from '@/module/authentication/domain/loginTypes';

// The default client rejects on an HTTP error (a wrong password is a 401), which the hooks turn
// into the "access denied" message.

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (body: LoginCredentials): Promise<LoginModelResponse> =>
  (await apiClient.post<LoginModelResponse>(API_AUTH.POST_LOGIN, body)).data;

export const exchangeOAuthCode = async (code: string): Promise<LoginModelResponse> =>
  (await apiClient.post<LoginModelResponse>(API_AUTH.POST_OAUTH_EXCHANGE, { code })).data;
