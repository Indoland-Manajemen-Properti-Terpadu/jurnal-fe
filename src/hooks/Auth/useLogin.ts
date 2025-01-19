import { useMutation } from '@tanstack/react-query';
import { post } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoint';

interface UseLoginProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useLogin = ({ onSuccess, onError }: UseLoginProps) => {
  return useMutation({
    mutationFn: async (body: any) => {
      const result = await post(API_ENDPOINTS.POST_LOGIN, body);
      return result;
    },
    onSuccess: (data) => {
      // Simpan token di localStorage atau sessionStorage
      localStorage.setItem('accessToken', data.tokens.access.token);
      localStorage.setItem('refreshToken', data.tokens.refresh.token);
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
      if (onError) {
        onError(error);
      }
    },
  });
};
