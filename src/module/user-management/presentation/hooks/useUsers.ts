import { useQuery } from '@tanstack/react-query';
import type { AllUserModel } from '@/module/user-management/domain/userTypes';
import { fetchUsers } from '@/module/user-management/infrastructure/userApi';

export const useUsers = (options = {}) =>
  useQuery<AllUserModel, Error>({
    queryKey: ['all_user'],
    queryFn: fetchUsers,
    ...options,
  });
