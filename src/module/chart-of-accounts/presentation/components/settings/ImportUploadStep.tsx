import React from 'react';
import {
  ActionIcon,
  Box,
  Button,
  FileInput,
  Flex,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconChevronRight,
  IconDownload,
  IconFileSpreadsheet,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import ImageImport from '@/assets/images/illustrations/settings-account-import.svg';
import { useTranslation } from '@/i18n';

interface ImportUploadStepProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onDownloadTemplate: () => void;
  isDownloadingTemplate: boolean;
  onCancel: () => void;
  onValidate: () => void;
  isUploading: boolean;
}

/** Step 1 of the import wizard: template download and file selection. */
export const ImportUploadStep: React.FC<ImportUploadStepProps> = ({
  selectedFile,
  onFileChange,
  onDownloadTemplate,
  isDownloadingTemplate,
  onCancel,
  onValidate,
  isUploading,
}) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Stack gap="md">
      {/* Top Vector Illustration Frame */}
      <Box
        style={{
          height: 124,
          borderRadius: 12,
          background:
            'linear-gradient(145deg, var(--mantine-color-sky-0) 0%, var(--mantine-color-sky-1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid color-mix(in srgb, var(--mantine-color-sky-5) 15%, transparent)',
        }}
      >
        <Image src={ImageImport} alt={t('settings.modal.importAlt')} h={88} fit="contain" />
      </Box>

      {/* Template Information Card */}
      <Paper
        withBorder
        radius="md"
        p="md"
        bg="blue.0"
        style={{ borderColor: 'var(--mantine-color-blue-2)' }}
      >
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          gap="sm"
        >
          <Box>
            <Text fw={700} size="sm" c="blue.9">
              {t('settings.import.templateTitle')}
            </Text>
            <Text size="xs" c="blue.8" mt={2}>
              {t('settings.import.templateDesc')}
            </Text>
          </Box>
          <Button
            variant="white"
            color="blue"
            size="xs"
            radius="md"
            leftSection={<IconDownload size={15} />}
            onClick={onDownloadTemplate}
            loading={isDownloadingTemplate}
          >
            {t('settings.import.templateButton')}
          </Button>
        </Flex>
      </Paper>

      {/* File Input Card */}
      <Paper withBorder radius="md" p="lg" bg="gray.0">
        <Stack gap="sm">
          <FileInput
            label={t('settings.import.fileLabel')}
            description={t('settings.import.fileDesc')}
            placeholder={t('settings.import.filePlaceholder')}
            leftSection={<IconUpload size={16} color="var(--mantine-color-dimmed)" />}
            accept=".xlsx,.xls,.csv"
            value={selectedFile}
            onChange={onFileChange}
            clearable
            size="sm"
            required
          />

          {selectedFile && (
            <Paper withBorder radius="md" p="xs" bg="white">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ThemeIcon size={30} radius="sm" color="teal" variant="light">
                    <IconFileSpreadsheet size={16} />
                  </ThemeIcon>
                  <Box>
                    <Text size="xs" fw={700} c="dark.8" lineClamp={1}>
                      {selectedFile.name}
                    </Text>
                    <Text size="10px" c="dimmed">
                      {t('settings.import.fileReady', {
                        size: (selectedFile.size / 1024).toFixed(1),
                      })}
                    </Text>
                  </Box>
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => onFileChange(null)}
                  aria-label={t('settings.import.removeFile')}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Paper>
          )}
        </Stack>
      </Paper>

      <Group justify="flex-end" gap="sm" mt="sm">
        <Button variant="default" size="sm" radius="md" onClick={onCancel}>
          {t('settings.import.cancel')}
        </Button>
        <Button
          color="primary"
          size="sm"
          radius="md"
          rightSection={<IconChevronRight size={16} />}
          disabled={!selectedFile}
          onClick={onValidate}
          loading={isUploading}
        >
          {t('settings.import.validate')}
        </Button>
      </Group>
    </Stack>
  );
};
