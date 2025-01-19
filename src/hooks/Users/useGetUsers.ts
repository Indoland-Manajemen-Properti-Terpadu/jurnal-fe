import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoint';

export const useGetUsers = () => useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await get(API_ENDPOINTS.GET_ALL_USER, null);
      return result;
    },
  });
