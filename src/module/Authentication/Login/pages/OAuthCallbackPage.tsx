import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '@/services/apiClient';
import { API_AUTH } from '@/services/endpoint';
import { routes } from '@/router';
import { useLoginHandler } from '../service/Login.service';
import { LoginModelResponse } from '../types/LoginModelResponse';

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleLoginSuccess } = useLoginHandler();

  useEffect(() => {
    const exchangeOAuthCode = async () => {
      const code = searchParams.get('code');
      const idSite = searchParams.get('id_site');

      if (!code || !idSite) {
        notifications.show({
          color: 'red',
          autoClose: 3000,
          title: 'OAuth Login Failed',
          message: 'Invalid OAuth callback data',
        });
        navigate(routes.login);
        return;
      }

      try {
        const response = await post(API_AUTH.POST_OAUTH_EXCHANGE, {
          code,
          id_site: idSite,
        });

        if (
          !response?.tokens?.access?.token
          || !response?.tokens?.refresh?.token
          || !response?.user?.name
        ) {
          throw new Error('OAuth exchange failed');
        }

        handleLoginSuccess(response as LoginModelResponse);
      } catch {
        notifications.show({
          color: 'red',
          autoClose: 3000,
          title: 'OAuth Login Failed',
          message: 'Unable to login with OAuth, please try again',
        });
        navigate(routes.login);
      }
    };

    exchangeOAuthCode();
  }, [handleLoginSuccess, navigate, searchParams]);

  return null;
}

export default OAuthCallbackPage;
