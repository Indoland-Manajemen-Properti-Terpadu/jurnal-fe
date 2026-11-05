import React from 'react';
import { Anchor, Box, Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowLeft, IconMail } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  defaultEmail = '',
}) => {
  const { t: ta } = useTranslation('authentication');

  return (
    <Stack gap="xl">
      <Box>
        <Title order={1} fz={32} c="dark.9" fw={700} lh={1.2}>
          {ta('forgot.title')}
        </Title>
        <Text fz="md" c="dimmed" mt="xs" lh={1.5}>
          {ta('forgot.intro')}
        </Text>
      </Box>

      <Stack gap="md">
        <TextInput
          label={ta('forgot.emailLabel')}
          placeholder={ta('login.emailPlaceholder')}
          defaultValue={defaultEmail}
          size="md"
          radius="md"
          type="email"
          autoComplete="email"
          leftSection={<IconMail size={18} />}
        />
        <Button type="button" size="md" radius="md" color="primary" fullWidth disabled>
          {ta('forgot.submit')}
        </Button>
        <Text fz="sm" c="dimmed" ta="center">
          {ta('forgot.unavailable')}
        </Text>
      </Stack>

      <Anchor
        component="button"
        type="button"
        size="sm"
        c="dimmed"
        ta="center"
        onClick={onBackToLogin}
      >
        <IconArrowLeft size={16} aria-hidden="true" /> {ta('forgot.backToLogin')}
      </Anchor>
    </Stack>
  );
};
