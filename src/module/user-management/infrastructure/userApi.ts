import { get } from '@/lib/http/apiClient';
import { API_USERS } from '@/services/endpoint';
import type { AllUserModel, UserDetail } from '@/module/user-management/domain/userTypes';

// These calls use the legacy `get`/`post` helpers, which return the Axios error response (or null)
// instead of throwing. Switching to throwing semantics is a separate decision (spec section 11).

export const fetchUsers = (): Promise<AllUserModel> => get(API_USERS.GET_ALL_USER);

export const fetchUserByEmail = (email: string): Promise<UserDetail> =>
  get(API_USERS.GET_USER_DETAIL, { payload: { email } });
