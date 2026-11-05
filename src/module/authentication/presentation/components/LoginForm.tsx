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
import { IconArrowLeft, IconArrowRight, IconLock, IconMail } from '@tabler/icons-react';
import GoogleIcon from '@/assets/images/brand/google.svg';
import { Link } from 'react-router-dom';
import { routes } from '@/router/routes';
import {
  validateEmail,
  validatePassword,
  type CredentialValidationKey,
} from '@/module/authentication/domain/credentialRules';

import { useTranslation } from '@/i18n';

interface LoginFormProps {
  onForgotPassword: (currentEmail?: string) => void;
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
    <Stack gap="xl">
      <Box>
        <Title order={1} fz={32} c="dark.9" fw={700} lh={1.2}>
          {ta('login.welcome')}
        </Title>
        <Text fz="md" c="dimmed" mt="xs" lh={1.5}>
          {ta('login.intro')}
        </Text>
      </Box>

      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Stack gap="md">
          <TextInput
            label={ta('login.emailLabel')}
            placeholder={ta('login.emailPlaceholder')}
            size="md"
            radius="md"
            required
            autoComplete="email"
            leftSection={<IconMail size={18} />}
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label={ta('login.passwordLabel')}
            placeholder={ta('login.passwordPlaceholder')}
            size="md"
            radius="md"
            required
            autoComplete="current-password"
            leftSection={<IconLock size={18} />}
            {...form.getInputProps('password')}
          />

          <Group justify="space-between" align="center">
            <Checkbox
              label={ta('login.remember')}
              size="sm"
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />
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
          </Group>

          <Button
            type="submit"
            size="md"
            radius="md"
            color="primary"
            fullWidth
            mt="xs"
            loading={isPending}
            rightSection={<IconArrowRight size={18} />}
          >
            {ta('login.submit')}
          </Button>
        </Stack>
      </form>

      <Stack gap="sm">
        <Divider label={ta('login.or')} labelPosition="center" />
        <Button
          type="button"
          size="md"
          radius="md"
          variant="default"
          fullWidth
          leftSection={<img src={GoogleIcon} width={20} height={20} alt="" />}
        >
          {ta('login.google')}
        </Button>
      </Stack>

      <Anchor
        component={Link}
        to={routes.landing}
        size="sm"
        c="dimmed"
        ta="center"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <IconArrowLeft size={16} />
        {ta('login.backHome')}
      </Anchor>
    </Stack>
  );
};
