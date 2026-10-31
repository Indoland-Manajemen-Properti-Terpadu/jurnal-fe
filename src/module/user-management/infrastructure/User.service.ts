import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { API_USERS } from '@/services/endpoint';
import { AllUserModel, UserDetail } from '@/module/user-management/domain/userTypes';

export const useGetAllUser = (options = {}) =>
  useQuery<AllUserModel, Error>({
    queryKey: ['all_user'],
    queryFn: async () => {
      const result = await get(API_USERS.GET_ALL_USER);
      return result;
    },
    ...options,
  });

export const GetUserByEmail = (userEmail: any, options = {}) =>
  useQuery<UserDetail>({
    queryKey: ['detail_user', userEmail],
    enabled: !!userEmail,
    queryFn: async () => {
      const payload = {
        email: userEmail,
      };
      const result = await get(API_USERS.GET_USER_DETAIL, { payload });
      return result;
    },
    ...options,
  });
