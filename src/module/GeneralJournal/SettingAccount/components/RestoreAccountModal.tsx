import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Group,
  Image,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconAlertTriangle, IconRotateClockwise } from '@tabler/icons-react';
import ImageRestore from '@/assets/img/SettingsAccount-Restore.svg';
import { useAccountSettings } from '../hooks/useAccountSettings';

interface RestoreAccountModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RestoreAccountModal: React.FC<RestoreAccountModalProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const { resetAccounts, isResetting } = useAccountSettings();
  const [confirmed, setConfirmed] = useState(false);

  const handleReset = async () => {
    if (!confirmed) return;
    try {
      await resetAccounts();
      setConfirmed(false);
      onClose();
      onSuccess?.();
    } catch {
      // Error handled in hook notification
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon size={34} radius="md" color="red" variant="light">
            <IconRotateClockwise size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="dark.9">
              Atur Ulang Bagan Akun ke Default
            </Text>
            <Text size="xs" c="dimmed">
              Pemulihan struktur Chart of Accounts (COA) bawaan sistem
            </Text>
          </Box>
        </Group>
      }
      size="lg"
      radius="md"
      centered
    >
      <Stack gap="md" mt="xs">
        <Box
          style={{
            height: 124,
            borderRadius: 12,
            background: 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(225, 29, 72, 0.15)',
          }}
        >
          <Image src={ImageRestore} alt="Atur Ulang Akun" h={88} fit="contain" />
        </Box>

        <Alert
          icon={<IconAlertTriangle size={18} />}
          color="red"
          variant="light"
          radius="md"
          title="Peringatan Tindakan Kritis"
        >
          Tindakan ini akan mengatur ulang seluruh bagan akun kembali ke format standar bawaan
          sistem akuntansi. Seluruh penyesuaian nama akun kustom atau akun tambahan yang dibuat
          secara manual akan direset ke pengaturan awal.
        </Alert>

        <Paper withBorder radius="md" p="md" bg="gray.0">
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
              Dampak Pengaturan Ulang:
            </Text>
            <Text size="xs" c="dark.7">
              1. Daftar akun kas, bank, piutang, hutang, modal, pendapatan, dan beban akan
              dikembalikan ke bagan akun standar PSAK.
            </Text>
            <Text size="xs" c="dark.7">
              2. Akun kustom yang belum memiliki transaksi historis akan dihapus.
            </Text>
            <Text size="xs" c="dark.7">
              3. Saldo awal akun yang telah dimasukkan mungkin perlu disesuaikan kembali.
            </Text>
          </Stack>
        </Paper>

        <Checkbox
          checked={confirmed}
          onChange={(e) => setConfirmed(e.currentTarget.checked)}
          label="Saya mengerti konsekuensi pengaturan ulang ini dan ingin memulihkan bagan akun ke standar default."
          color="red"
          size="sm"
        />

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button
            variant="default"
            size="sm"
            radius="md"
            onClick={handleClose}
            disabled={isResetting}
          >
            Batal
          </Button>
          <Button
            color="red"
            size="sm"
            radius="md"
            leftSection={<IconRotateClockwise size={16} />}
            onClick={handleReset}
            disabled={!confirmed}
            loading={isResetting}
          >
            Pulihkan ke Akun Standar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
