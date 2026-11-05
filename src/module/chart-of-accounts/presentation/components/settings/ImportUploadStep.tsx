import React, { useState } from 'react';
import { ActionIcon, Box, Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertCircle,
  IconCloudUpload,
  IconChevronRight,
  IconDownload,
  IconFileSpreadsheet,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { IMPORT_ACCEPT, validateImportFile } from '@/module/chart-of-accounts/domain/importFile';
import { SettingHero } from './SettingHero';
import classes from './SettingModals.module.css';

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
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    const problem = validateImportFile(file);
    if (problem) {
      setFileError(
        t(problem === 'size' ? 'settings.import.fileTooLarge' : 'settings.import.fileTypeInvalid')
      );
      return;
    }
    setFileError(null);
    onFileChange(file);
  };

  const removeFile = () => {
    setFileError(null);
    onFileChange(null);
  };

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" p="md" bg="white">
        <Group wrap="nowrap" gap="lg" align="center">
          <Box w={168} visibleFrom="sm" style={{ flexShrink: 0 }}>
            <SettingHero tone="import" height={104} />
          </Box>
          <Stack gap={6} style={{ flex: 1 }} align="flex-start">
            <Text fw={700} fz="sm" c="dark.9">
              {t('settings.import.templateTitle')}
            </Text>
            <Text fz="xs" c="dimmed" lh={1.5}>
              {t('settings.import.templateDesc')}
            </Text>
            <Button
              variant="default"
              size="xs"
              radius="md"
              leftSection={<IconDownload size={15} />}
              onClick={onDownloadTemplate}
              loading={isDownloadingTemplate}
            >
              {t('settings.import.templateButton')}
            </Button>
          </Stack>
        </Group>
      </Paper>

      <Stack gap={6}>
        <Text fw={600} fz="sm" c="dark.9">
          {t('settings.import.fileLabel')}
        </Text>

        {selectedFile ? (
          <Paper withBorder radius="lg" p="sm" bg="white">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon size={40} radius="md" color="teal" variant="light">
                  <IconFileSpreadsheet size={22} />
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Text fz="sm" fw={600} c="dark.9" lineClamp={1}>
                    {selectedFile.name}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {t('settings.import.fileReady', {
                      size: (selectedFile.size / 1024).toFixed(1),
                    })}
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={removeFile}
                aria-label={t('settings.import.removeFile')}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          </Paper>
        ) : (
          <label
            className={classes.dropzone}
            data-dragging={dragging}
            data-error={Boolean(fileError)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              acceptFile(event.dataTransfer.files[0]);
            }}
          >
            <input
              className={classes.fileInput}
              type="file"
              accept={IMPORT_ACCEPT}
              onChange={(event) => {
                acceptFile(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
            <ThemeIcon size={48} radius="xl" color="primary" variant="light">
              <IconCloudUpload size={26} />
            </ThemeIcon>
            <Text fw={600} fz="sm" c="dark.9">
              {dragging ? t('settings.import.dropActive') : t('settings.import.dropTitle')}
            </Text>
            <Text fz="xs" c="dimmed">
              {t('settings.import.fileDesc')}
            </Text>
          </label>
        )}

        {fileError && (
          <Group gap={6} wrap="nowrap" role="alert">
            <IconAlertCircle size={16} color="var(--mantine-color-red-7)" />
            <Text fz="xs" c="red.7">
              {fileError}
            </Text>
          </Group>
        )}
      </Stack>

      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="default" radius="md" onClick={onCancel}>
          {t('settings.import.cancel')}
        </Button>
        <Button
          color="primary"
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
