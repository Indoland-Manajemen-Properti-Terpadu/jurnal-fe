import { useQuery } from '@tanstack/react-query';
import type { UserDetail } from '@/module/user-management/domain/userTypes';
import { fetchUserByEmail } from '@/module/user-management/infrastructure/userApi';

export const useUserByEmail = (userEmail: string | undefined, options = {}) =>
  useQuery<UserDetail>({
    queryKey: ['detail_user', userEmail],
    enabled: !!userEmail,
    queryFn: () => fetchUserByEmail(userEmail as string),
    ...options,
  });
