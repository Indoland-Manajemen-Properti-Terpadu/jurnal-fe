import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FileInput,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconDownload,
  IconFileSpreadsheet,
  IconUpload,
} from '@tabler/icons-react';
import {
  useDownloadContactTemplate,
  useImportContacts,
} from '../hooks/useContactQueries';

type ContactImportModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function ContactImportModal({ opened, onClose }: Readonly<ContactImportModalProps>) {
  const [file, setFile] = useState<File | null>(null);

  const downloadTemplateMutation = useDownloadContactTemplate();
  const importMutation = useImportContacts();

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      await importMutation.mutateAsync(file);
      handleClose();
    } catch {
      // Error handled by mutation notification
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" color="primary" variant="light">
            <IconUpload size={16} />
          </ThemeIcon>
          <Text fw={700} size="md" c="primary.9">
            Impor Data Kontak
          </Text>
        </Group>
      }
      size="md"
      radius="md"
      centered
    >
      <Stack gap="md" pt="xs">
        <Alert color="blue" icon={<IconAlertCircle size={16} />}>
          Pastikan format file sesuai dengan template resmi sistem. Gunakan tombol di bawah
          untuk mengunduh template terbaru sebelum mengunggah.
        </Alert>

        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Box>
              <Text size="xs" fw={700} c="dark.8">
                Template Data Kontak
              </Text>
              <Text size="xs" c="dimmed">
                Format spreadsheet (.xlsx) lengkap dengan kolom pemetaan.
              </Text>
            </Box>
            <Button
              size="xs"
              variant="outline"
              color="primary"
              leftSection={<IconDownload size={14} />}
              loading={downloadTemplateMutation.isPending}
              onClick={() => downloadTemplateMutation.mutate()}
            >
              Unduh Template
            </Button>
          </Group>
        </Paper>

        <FileInput
          label="Pilih File Excel / Spreadsheet"
          placeholder="Klik untuk memilih file .xlsx atau .xls"
          leftSection={<IconFileSpreadsheet size={16} />}
          accept=".xlsx,.xls,.csv"
          value={file}
          onChange={setFile}
          clearable
          required
        />

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={handleClose} disabled={importMutation.isPending}>
            Batal
          </Button>
          <Button
            color="primary"
            leftSection={<IconUpload size={16} />}
            loading={importMutation.isPending}
            disabled={!file}
            onClick={handleImport}
          >
            Mulai Impor
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ContactImportModal;

