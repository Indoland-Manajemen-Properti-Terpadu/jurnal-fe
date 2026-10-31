import { post } from '@/lib/http/apiClient';
import { API_AUTH } from '@/services/endpoint';
import type { LoginModelResponse } from '@/module/authentication/domain/loginTypes';

// These calls use the legacy `post` helper, which returns the Axios error response (or null) instead
// of throwing; a failed login then breaks in the hook's onSuccess and lands in onError.

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (body: LoginCredentials) =>
  (await post(API_AUTH.POST_LOGIN, body)) as LoginModelResponse;

export const exchangeOAuthCode = async (code: string) =>
  (await post(API_AUTH.POST_OAUTH_EXCHANGE, { code })) as LoginModelResponse;
