import { ActionIcon, Container, Group, Image, Paper, Progress, Stack, Text } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconTrash, IconX } from '@tabler/icons-react';
import { CloudArrowUp, Files } from '@phosphor-icons/react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import uploadTemplateImage from '@/assets/images/illustrations/import.svg';
import { MAX_IMPORT_FILE_BYTES, formatBytes } from '../../domain/importDraft';

type Props = {
  files: File[];
  setFiles: (files: File[]) => void;
  uploading: boolean;
  progress: number;
  timeRemaining: number;
  uploadError: string | null;
  onDismissError: () => void;
  onDrop: (files: File[]) => void;
  onReject: () => void;
};

const ImportStepUpload = ({
  files,
  setFiles,
  uploading,
  progress,
  timeRemaining,
  uploadError,
  onDismissError,
  onDrop,
  onReject,
}: Props) => {
  const { t } = useTranslation('bankStatements');
  return (
    <Container fluid pt={20} pb={20}>
      <Stack gap="xl">
        <Group align="center" wrap="nowrap" gap="xl">
          <Image
            src={uploadTemplateImage}
            w={150}
            h="auto"
            fallbackSrc="https://placehold.co/150x150?text=Illustration"
          />
          <Stack gap="xs">
            <Text fw={600} fz="var(--jurnal-text-lg)" c={themeColors.black[9]}>
              {t('importModal.upload.heading')}
            </Text>
            <Text fw={400} fz="var(--jurnal-text-sm)" c={themeColors.gray[7]}>
              {t('importModal.upload.body')}
            </Text>
          </Stack>
        </Group>

        <Dropzone
          onDrop={onDrop}
          onReject={onReject}
          maxSize={MAX_IMPORT_FILE_BYTES}
          accept={[MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.xlsx]}
          styles={(theme) => ({
            root: {
              border: `2px dashed ${themeColors.black[2]}`,
              borderRadius: theme.radius.md,
              padding: theme.spacing.xl,
              backgroundColor: 'var(--mantine-color-white)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: themeColors.primary[0],
              },
            },
          })}
        >
          <Group
            justify="center"
            gap="xs"
            mih={180}
            style={{ pointerEvents: 'none', flexDirection: 'column' }}
          >
            <CloudArrowUp size={56} color={themeColors.primary[5]} weight="bold" />
            <Text size="md" fw={600} c={themeColors.black[9]} mt="md" ta="center">
              {t('importModal.upload.dropTitle')}
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={500}>
              {t('importModal.upload.dropHint')}
            </Text>
          </Group>
        </Dropzone>

        {uploadError && (
          <Paper
            withBorder
            p="sm"
            radius="md"
            style={{ borderColor: 'red', backgroundColor: 'var(--mantine-color-red-0)' }}
          >
            <Group justify="space-between">
              <Group gap="sm">
                <IconX color="red" size={20} />
                <Text size="sm" c="red">
                  {uploadError}
                </Text>
              </Group>
              <ActionIcon variant="subtle" color="gray" onClick={onDismissError}>
                <IconX size={16} />
              </ActionIcon>
            </Group>
          </Paper>
        )}

        {(uploading || files.length > 0) && (
          <Stack gap="xs">
            <Text fw={600} fz="var(--jurnal-text-sm)" c={themeColors.black[9]}>
              {t('importModal.upload.uploadedFiles')}
            </Text>
            {files.map((file, index) => (
              <Paper key={index} withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Group wrap="nowrap" gap="xs" align="flex-start">
                    <Files
                      size={24}
                      color={themeColors.blue[6]}
                      weight="bold"
                      style={{ marginTop: 2 }}
                    />
                    <Stack gap={0} style={{ flex: 1 }}>
                      <Text size="sm" fw={600} c={themeColors.black[9]}>
                        {file.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatBytes(file.size)} | {Math.round(progress)}% •{' '}
                        {uploading
                          ? t('importModal.upload.timeLeft', { seconds: timeRemaining })
                          : t('importModal.upload.complete')}
                      </Text>
                    </Stack>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                  <Progress
                    value={progress}
                    color={themeColors.primary[5]}
                    size="md"
                    radius="xl"
                    animated={uploading}
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default ImportStepUpload;
