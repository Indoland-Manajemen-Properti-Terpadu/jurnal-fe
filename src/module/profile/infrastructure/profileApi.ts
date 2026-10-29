import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '@/lib/http/apiClient';
import { API_USERS } from '@/services/endpoint';
import { User } from '@/module/Authentication/Login/types/LoginModelResponse';
import { notifications } from '@mantine/notifications';

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const result = await get(API_USERS.GET_USER_DETAIL);
      return result as User;
    },
  });
};

export interface UpdateProfilePayload {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  accessRole?: any[];
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateProfilePayload) => {
      const result = await patch(`/v1/users/${id}`, payload);
      if (result && (result.status >= 400 || result.code >= 400)) {
        throw new Error(result.data?.message || result.message || 'Gagal memperbarui profil');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifications.show({
        color: 'teal',
        title: 'Berhasil',
        message: 'Perubahan profil berhasil disimpan.',
      });
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: error?.message || 'Terjadi kesalahan saat memperbarui profil.',
      });
    },
  });
};
