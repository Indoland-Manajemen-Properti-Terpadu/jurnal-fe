import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { UserList, UserListParams } from '@/module/user-management/domain/userTypes';
import { fetchUsers } from '@/module/user-management/infrastructure/userApi';
import { retryTransient } from './queryRetry';
import { userManagementKeys } from './userManagementKeys';

/** One page of users; with no params the API's first page is used. */
export const useUsers = (
  params: Partial<UserListParams> = {},
  options: { enabled?: boolean } = {}
) =>
  useQuery<UserList, Error>({
    queryKey: userManagementKeys.users(params),
    queryFn: () => fetchUsers(params),
    retry: retryTransient,
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
