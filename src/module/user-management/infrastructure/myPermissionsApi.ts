import apiClient from '@/lib/http/apiClient';
import { API_USERS } from '@/lib/http/endpoints';
import type { MyGrants } from '@/module/user-management/domain/grantRules';
import type { MyPermissionsDto } from './dto';
import { toMyGrants } from './mappers';

/** Answers without the `{ code, message, data }` envelope. */
export const fetchMyGrants = async (): Promise<MyGrants> =>
  toMyGrants((await apiClient.get<MyPermissionsDto>(API_USERS.MY_PERMISSIONS)).data);

/** Id of the signed-in user, used to stop someone from switching themselves off. */
export const fetchMyId = async (): Promise<string> =>
  (await apiClient.get<{ id: string }>(API_USERS.ME)).data.id;
