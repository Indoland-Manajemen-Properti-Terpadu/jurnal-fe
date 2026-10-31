import React, { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  validateEmail,
  type CredentialValidationKey,
} from '@/module/authentication/domain/credentialRules';
import {
  IconArrowLeft,
  IconCheck,
  IconInfoCircle,
  IconMail,
  IconMailCheck,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react';

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const msg = (key: CredentialValidationKey | null) => (key ? ta(key) : null);
  const form = useForm({
    initialValues: {
      email: defaultEmail,
    },
    validate: {
      email: (val) => msg(validateEmail(val)),
    },
  });

  const handleSubmit = (values: { email: string }) => {
    setIsSubmitting(true);
    // Simulate sending password reset link
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      notifications.show({
        color: 'teal',
        icon: <IconCheck size={16} />,
        title: ta('forgot.sentTitle'),
        message: ta('forgot.sentMessage', { email: values.email }),
      });
    }, 1200);
  };

  const handleResend = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      notifications.show({
        color: 'teal',
        icon: <IconCheck size={16} />,
        title: ta('forgot.resentTitle'),
        message: ta('forgot.resentMessage', { email: form.values.email }),
      });
    }, 800);
  };

  if (isSuccess) {
    return (
      <Stack gap="lg" ta="center" py="md">
        <ThemeIcon size={64} radius="xl" color="teal" variant="light" mx="auto">
          <IconMailCheck size={36} stroke={1.8} />
        </ThemeIcon>

        <Box>
          <Title order={3} c="dark.9" fw={800}>
            {ta('forgot.checkEmail')}
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            {ta('forgot.sentTo')}
          </Text>
          <Badge
            size="lg"
            variant="light"
            color="primary"
            mt="xs"
            radius="md"
            style={{ textTransform: 'none' }}
          >
            {form.values.email}
          </Badge>
        </Box>

        <Text size="xs" c="gray.6" lh={1.6} px="md">
          {ta('forgot.checkInbox')}
        </Text>

        <Stack gap="sm" mt="md">
          <Button size="md" radius="md" color="primary" fullWidth onClick={onBackToLogin}>
            {ta('forgot.backToSignIn')}
          </Button>

          <Button
            variant="subtle"
            size="sm"
            color="gray"
            leftSection={<IconRefresh size={14} />}
            onClick={handleResend}
            loading={isSubmitting}
          >
            {ta('forgot.resend')}
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Box>
        <Group gap="xs" mb="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            radius="md"
            onClick={onBackToLogin}
            aria-label={ta('forgot.backToLogin')}
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text size="xs" fw={700} c="primary.7" tt="uppercase">
            {ta('forgot.help')}
          </Text>
        </Group>

        <Title order={2} c="dark.9" fw={800} lh={1.25}>
          {ta('forgot.title')}
        </Title>
        <Text size="sm" c="gray.6" mt={4} lh={1.5}>
          {ta('forgot.intro')}
        </Text>
      </Box>

      {/* Form */}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={ta('forgot.emailLabel')}
            placeholder={ta('login.emailPlaceholder')}
            size="md"
            radius="md"
            required
            leftSection={<IconMail size={18} />}
            {...form.getInputProps('email')}
          />

          <Alert
            color="blue"
            variant="light"
            radius="md"
            icon={<IconInfoCircle size={18} />}
            styles={{ message: { fontSize: 'var(--jurnal-text-xs)', lineHeight: 1.5 } }}
          >
            {ta('forgot.emailHint')}
          </Alert>

          <Button
            type="submit"
            size="md"
            radius="md"
            color="primary"
            fullWidth
            mt="xs"
            loading={isSubmitting}
            leftSection={<IconSend size={16} />}
          >
            {ta('forgot.submit')}
          </Button>

          <Button
            type="button"
            variant="subtle"
            color="gray"
            size="sm"
            fullWidth
            onClick={onBackToLogin}
          >
            {ta('forgot.cancel')}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
