import React from 'react';
import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconHome, IconLock, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { routes } from '@/router/routes';
import {
  validateEmail,
  validatePassword,
  type CredentialValidationKey,
} from '@/module/authentication/domain/credentialRules';

import { useTranslation } from '@/i18n';

interface LoginFormProps {
  /** Omitted when password recovery is not available; the link is then not shown. */
  onForgotPassword?: (currentEmail?: string) => void;
  onSubmit: (values: { email: string; password: string }) => void;
  isPending: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword, onSubmit, isPending }) => {
  const { t: ta } = useTranslation('authentication');
  const msg = (key: CredentialValidationKey | null) => (key ? ta(key) : null);
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (val) => msg(validateEmail(val)),
      password: (val) => msg(validatePassword(val)),
    },
  });

  const handleFormSubmit = (values: typeof form.values) => {
    onSubmit({ email: values.email, password: values.password });
  };

  return (
    <Stack gap="lg">
      {/* Form Header */}
      <Box>
        <Title order={2} c="dark.9" fw={800} lh={1.25}>
          {ta('login.welcome')}
        </Title>
        <Text size="sm" c="gray.6" mt={4} lh={1.5}>
          {ta('login.intro')}
        </Text>
      </Box>

      {/* Inputs Form */}
      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Stack gap="md">
          <TextInput
            label={ta('login.emailLabel')}
            placeholder={ta('login.emailPlaceholder')}
            size="md"
            radius="md"
            required
            leftSection={<IconMail size={18} />}
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label={ta('login.passwordLabel')}
            placeholder={ta('login.passwordPlaceholder')}
            size="md"
            radius="md"
            required
            leftSection={<IconLock size={18} />}
            {...form.getInputProps('password')}
          />

          <Group justify="space-between" align="center" mt={2}>
            <Checkbox
              label={ta('login.remember')}
              size="sm"
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />
            {onForgotPassword && (
              <Anchor
                component="button"
                type="button"
                size="sm"
                fw={600}
                c="primary.7"
                onClick={() => onForgotPassword(form.values.email)}
              >
                {ta('login.forgot')}
              </Anchor>
            )}
          </Group>

          <Button
            type="submit"
            size="md"
            radius="md"
            color="primary"
            fullWidth
            mt="sm"
            loading={isPending}
            rightSection={<IconArrowRight size={18} />}
          >
            {ta('login.submit')}
          </Button>

          <Divider label={ta('login.or')} labelPosition="center" my="xs" />

          <Button
            component={Link}
            to={routes.landing}
            variant="default"
            size="md"
            radius="md"
            fullWidth
            leftSection={<IconHome size={18} />}
          >
            {ta('login.backHome')}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
