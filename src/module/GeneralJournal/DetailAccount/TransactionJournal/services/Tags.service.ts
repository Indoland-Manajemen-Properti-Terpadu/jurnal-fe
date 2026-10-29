import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/http/apiClient';
import { API_TAGS } from '@/services/endpoint';
import { notifications } from '@mantine/notifications';

export interface Tag {
  id: string;
  site: string;
  name: string;
  color: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TagsResponse {
  code: number;
  message: string;
  data: {
    data: Tag[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const useGetTags = (page = 1) => {
  return useQuery<TagsResponse>({
    queryKey: ['tags', page],
    queryFn: async () => {
      const response = await get(`${API_TAGS.GET_ALL_TAGS}?page=${page}`);
      return response;
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await post(API_TAGS.POST_TAG, { name });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Tag has been successfully created.',
      });
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Failed to create tag: ${error?.response?.data?.message || error.message}`,
      });
    },
  });
};
