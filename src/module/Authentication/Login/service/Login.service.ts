import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { post } from '@/services/apiClient';
import { API_AUTH } from '@/services/endpoint';
import { routes } from '@/router';
import { useAuthStore } from '@/store/useAuthentications';
import { LoginModelResponse } from '../types/LoginModelResponse';

interface UseLoginProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useLoginHandler = () => {
  const navigate = useNavigate();
  const { setTokens, setUserName } = useAuthStore();

  const handleLoginSuccess = (data: LoginModelResponse) => {
    const { tokens, user } = data;
    localStorage.setItem('accessToken', tokens.access.token);
    localStorage.setItem('refreshToken', tokens.refresh.token);
    localStorage.setItem('userName', user.name);
    setTokens(tokens.access.token, tokens.refresh.token);
    setUserName(user.name);
    notifications.show({
      color: 'cyan',
      autoClose: 3000,
      title: 'Login Successful!',
      message: `Hey ${user.name}, Welcome to Journal Proapps. Let’s get started!`,
    });
    navigate(routes.dashboard);
  };

  const handleLoginError = () => {
    notifications.show({
      color: 'red',
      autoClose: 3000,
      title: 'Access Denied',
      message: 'Incorrect email & password, please try again',
    });
  };

  return {
    handleLoginSuccess,
    handleLoginError,
  };
};

export const useLogin = (p0: {}) => {
  const { handleLoginSuccess, handleLoginError } = useLoginHandler();

  return useMutation({
    mutationFn: async (body: any) => {
      const result = await post(API_AUTH.POST_LOGIN, body);
      return result as LoginModelResponse;
    },

    onSuccess: handleLoginSuccess,
    onError: () => {
      handleLoginError();
      // if (onError) onError(error);
    },
  });
};
