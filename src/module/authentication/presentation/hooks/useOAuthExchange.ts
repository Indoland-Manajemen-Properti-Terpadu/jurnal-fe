import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { routes } from '@/router/routes';
import { useAuthStore } from '@/store/useAuthentications';
import { useTranslation } from '@/i18n';
import { exchangeOAuthCode } from '@/module/authentication/infrastructure/authApi';

export const useOAuthExchange = () => {
  const navigate = useNavigate();
  const { setTokens, setUserName } = useAuthStore();
  const { t: ta } = useTranslation('authentication');

  return useMutation({
    mutationFn: (code: string) => exchangeOAuthCode(code),
    onSuccess: (data) => {
      const { tokens, user } = data;
      setTokens(tokens.access.token, tokens.refresh.token);
      setUserName(user.name);
      notifications.show({
        color: 'green',
        autoClose: 3000,
        title: ta('login.successTitle'),
        message: ta('oauth.successMessage'),
      });
      navigate(routes.dashboard);
    },
    onError: () => {
      notifications.show({
        color: 'red',
        autoClose: 3000,
        title: ta('oauth.failedTitle'),
        message: ta('oauth.failedMessage'),
      });
      navigate(routes.login);
    },
  });
};
