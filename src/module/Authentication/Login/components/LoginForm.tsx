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
import {
  IconArrowRight,
  IconHome,
  IconLock,
  IconMail,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { routes } from '@/router/routes';

interface LoginFormProps {
  onForgotPassword: (currentEmail?: string) => void;
  onSubmit: (values: { email: string; password: string }) => void;
  isPending: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onForgotPassword,
  onSubmit,
  isPending,
}) => {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (val) => (/^\S+@\S+\.\S+$/.test(val) ? null : 'Alamat email tidak valid'),
      password: (val) => (val.length < 6 ? 'Kata sandi minimal 6 karakter' : null),
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
          Selamat Datang Kembali 👋
        </Title>
        <Text size="sm" c="gray.6" mt={4} lh={1.5}>
          Masuk ke akun Anda untuk mengakses sistem pembukuan dan laporan keuangan bisnis.
        </Text>
      </Box>

      {/* Inputs Form */}
      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Alamat Email"
            placeholder="nama@perusahaan.com"
            size="md"
            radius="md"
            required
            leftSection={<IconMail size={18} />}
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Kata Sandi"
            placeholder="Masukkan kata sandi akun Anda"
            size="md"
            radius="md"
            required
            leftSection={<IconLock size={18} />}
            {...form.getInputProps('password')}
          />

          <Group justify="space-between" align="center" mt={2}>
            <Checkbox
              label="Ingat saya"
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
              Lupa kata sandi?
            </Anchor>
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
            Masuk ke Akun
          </Button>

          <Divider label="atau" labelPosition="center" my="xs" />

          <Button
            component={Link}
            to={routes.landingPage}
            variant="default"
            size="md"
            radius="md"
            fullWidth
            leftSection={<IconHome size={18} />}
          >
            Kembali ke Beranda
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

