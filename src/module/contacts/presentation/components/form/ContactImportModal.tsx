import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FileInput,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Table,
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
import { ContactImportError } from '@/module/contacts/domain/contactImport';
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
  const [failure, setFailure] = useState<ContactImportError | null>(null);

  const downloadTemplateMutation = useDownloadContactTemplate();
  const importMutation = useImportContacts();

  const handleClose = () => {
    setFile(null);
    setFailure(null);
    onClose();
  };

  const handleFileChange = (next: File | null) => {
    setFile(next);
    setFailure(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setFailure(null);
    try {
      await importMutation.mutateAsync(file);
      handleClose();
    } catch (error) {
      // A refused file lists its rows below; any other failure is a toast of the mutation.
      if (error instanceof ContactImportError) setFailure(error);
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
      size={failure ? 'lg' : 'md'}
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
          onChange={handleFileChange}
          clearable
          required
        />

        {failure && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            <Stack gap="xs">
              <Text size="sm" fw={600}>
                {failure.message || t('import.failedSummary')}
              </Text>
              <ScrollArea.Autosize mah={260}>
                <Table withTableBorder withColumnBorders verticalSpacing={6} fz="xs" bg="white">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={70}>{t('import.colRow')}</Table.Th>
                      <Table.Th>{t('import.colField')}</Table.Th>
                      <Table.Th>{t('import.colReason')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {failure.issues.map((issue, index) => (
                      <Table.Tr key={`${issue.row}-${issue.field ?? ''}-${index}`}>
                        <Table.Td>{issue.row}</Table.Td>
                        <Table.Td>{issue.field ?? t('import.wholeRow')}</Table.Td>
                        <Table.Td>{issue.reason}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea.Autosize>
            </Stack>
          </Alert>
        )}

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
