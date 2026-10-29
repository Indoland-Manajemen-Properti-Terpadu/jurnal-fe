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
  IconArrowLeft,
  IconCheck,
  IconInfoCircle,
  IconMail,
  IconMailCheck,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  defaultEmail = '',
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      email: defaultEmail,
    },
    validate: {
      email: (val) => (/^\S+@\S+\.\S+$/.test(val) ? null : 'Masukkan alamat email yang valid'),
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
        title: 'Tautan Terkirim',
        message: `Instruksi pemulihan kata sandi telah dikirim ke ${values.email}.`,
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
        title: 'Tautan Dikirim Ulang',
        message: `Email instruksi baru telah dikirimkan ke ${form.values.email}.`,
      });
    }, 800);
  };

  if (isSuccess) {
    return (
      <Stack gap="lg" ta="center" py="md">
        <ThemeIcon
          size={64}
          radius="xl"
          color="teal"
          variant="light"
          mx="auto"
        >
          <IconMailCheck size={36} stroke={1.8} />
        </ThemeIcon>

        <Box>
          <Title order={3} c="dark.9" fw={800}>
            Periksa Email Anda 📬
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Kami telah mengirimkan tautan pemulihan kata sandi ke:
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
          Silakan buka kotak masuk atau folder spam email Anda dan klik tombol di dalamnya untuk mengatur ulang kata sandi baru. Tautan ini berlaku selama 60 menit.
        </Text>

        <Stack gap="sm" mt="md">
          <Button
            size="md"
            radius="md"
            color="primary"
            fullWidth
            onClick={onBackToLogin}
          >
            Kembali ke Halaman Masuk
          </Button>

          <Button
            variant="subtle"
            size="sm"
            color="gray"
            leftSection={<IconRefresh size={14} />}
            onClick={handleResend}
            loading={isSubmitting}
          >
            Tidak menerima email? Kirim ulang
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
            aria-label="Kembali ke Login"
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text size="xs" fw={700} c="primary.7" tt="uppercase">
            Bantuan Akun
          </Text>
        </Group>

        <Title order={2} c="dark.9" fw={800} lh={1.25}>
          Lupa Kata Sandi? 🔑
        </Title>
        <Text size="sm" c="gray.6" mt={4} lh={1.5}>
          Masukkan alamat email yang terdaftar. Kami akan mengirimkan instruksi dan tautan untuk membuat kata sandi baru.
        </Text>
      </Box>

      {/* Form */}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Alamat Email Terdaftar"
            placeholder="nama@perusahaan.com"
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
            styles={{ message: { fontSize: '12px', lineHeight: 1.5 } }}
          >
            Pastikan email yang dimasukkan sama dengan yang terdaftar di akun ProApps Jurnal Anda.
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
            Kirim Tautan Pemulihan
          </Button>

          <Button
            type="button"
            variant="subtle"
            color="gray"
            size="sm"
            fullWidth
            onClick={onBackToLogin}
          >
            Batal dan Kembali ke Login
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

