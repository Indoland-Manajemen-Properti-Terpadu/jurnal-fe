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
import { useTranslation } from '@/i18n';
import {
  useDownloadContactTemplate,
  useImportContacts,
} from '@/module/contacts/presentation/hooks/useContactQueries';

type ContactImportModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function ContactImportModal({ opened, onClose }: Readonly<ContactImportModalProps>) {
  const { t } = useTranslation('contacts');
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
            {t('import.title')}
          </Text>
        </Group>
      }
      size="md"
      radius="md"
      centered
    >
      <Stack gap="md" pt="xs">
        <Alert color="blue" icon={<IconAlertCircle size={16} />}>
          {t('import.notice')}
        </Alert>

        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Box>
              <Text size="xs" fw={700} c="dark.8">
                {t('import.templateTitle')}
              </Text>
              <Text size="xs" c="dimmed">
                {t('import.templateDescription')}
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
              {t('import.downloadTemplate')}
            </Button>
          </Group>
        </Paper>

        <FileInput
          label={t('import.fileLabel')}
          placeholder={t('import.filePlaceholder')}
          leftSection={<IconFileSpreadsheet size={16} />}
          accept=".xlsx,.xls,.csv"
          value={file}
          onChange={setFile}
          clearable
          required
        />

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={handleClose} disabled={importMutation.isPending}>
            {t('import.cancel')}
          </Button>
          <Button
            color="primary"
            leftSection={<IconUpload size={16} />}
            loading={importMutation.isPending}
            disabled={!file}
            onClick={handleImport}
          >
            {t('import.start')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ContactImportModal;
