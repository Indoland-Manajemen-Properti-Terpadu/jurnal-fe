import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useOAuthExchange } from '@/module/authentication/presentation/hooks/useOAuthExchange';

import { useTranslation } from '@/i18n';

export default function OAuthCallbackPage() {
  const { t: ta } = useTranslation('authentication');
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const { mutate: exchangeCode } = useOAuthExchange();
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    if (code && !exchangeAttempted.current) {
      exchangeAttempted.current = true;
      exchangeCode(code);
    }
  }, [code, exchangeCode]);

  return (
    <Center h="100vh" bg="gray.0">
      <Stack align="center" gap="md">
        <Loader size="xl" variant="dots" />
        <Text size="lg" fw={500} c="dimmed">
          {!code ? ta('oauth.invalidCode') : ta('oauth.waiting')}
        </Text>
      </Stack>
    </Center>
  );
}
