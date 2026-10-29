import React from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Image,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconDownload, IconFileSpreadsheet, IconInfoCircle } from '@tabler/icons-react';
import ImageExport from '@/assets/img/SettingsAccount-Export.svg';
import { useAccountSettings } from '../../hooks/useAccountSettings';

interface ExportAccountModalProps {
  opened: boolean;
  onClose: () => void;
  totalAccounts?: number;
}

export const ExportAccountModal: React.FC<ExportAccountModalProps> = ({
  opened,
  onClose,
  totalAccounts = 0,
}) => {
  const { exportAccounts, isExporting } = useAccountSettings();

  const handleExport = () => {
    exportAccounts(undefined, {
      onSuccess: () => {
        setTimeout(() => {
          onClose();
        }, 800);
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon size={34} radius="md" color="teal" variant="light">
            <IconDownload size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="dark.9">
              Ekspor Data Bagan Akun (COA)
            </Text>
            <Text size="xs" c="dimmed">
              Unduh seluruh daftar akun pembukuan ke berkas spreadsheet
            </Text>
          </Box>
        </Group>
      }
      size="md"
      radius="md"
      centered
    >
      <Stack gap="md" mt="xs">
        <Box
          style={{
            height: 124,
            borderRadius: 12,
            background: 'linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(20, 184, 166, 0.15)',
          }}
        >
          <Image src={ImageExport} alt="Ekspor Akun" h={88} fit="contain" />
        </Box>

        <Paper
          withBorder
          radius="md"
          p="md"
          bg="teal.0"
          style={{ borderColor: 'var(--mantine-color-teal-3)' }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ThemeIcon size={36} radius="md" color="teal" variant="filled">
                <IconFileSpreadsheet size={20} />
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={700} c="teal.9">
                  Microsoft Excel Spreadsheet (.xlsx)
                </Text>
                <Text size="xs" c="teal.8">
                  Berisi kode akun, nama akun, kategori, posisi saldo, dan saldo berjalan
                </Text>
              </Box>
            </Group>
            {totalAccounts > 0 && (
              <Badge color="teal" variant="light" size="sm">
                {totalAccounts} Akun
              </Badge>
            )}
          </Group>
        </Paper>

        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" radius="md">
          Berkas yang diekspor dapat digunakan untuk audit, backup berkala, analisis spreadsheet
          lanjutan, atau migrasi data ke sistem eksternal.
        </Alert>

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="default" size="sm" radius="md" onClick={onClose} disabled={isExporting}>
            Tutup
          </Button>
          <Button
            color="teal"
            size="sm"
            radius="md"
            leftSection={<IconDownload size={16} />}
            onClick={handleExport}
            loading={isExporting}
          >
            Unduh Berkas Excel (.xlsx)
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
