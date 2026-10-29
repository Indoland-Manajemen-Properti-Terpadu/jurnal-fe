import React from 'react';
import { Group, Text, Stack, ActionIcon, Paper, ThemeIcon, Tooltip, Box } from '@mantine/core';
import {
  IconDownload,
  IconEye,
  IconFileText,
  IconFileTypePdf,
  IconPhoto,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { JournalAttachment } from '../../domain/journalEntry';

interface JournalAttachmentsProps {
  attachments?: JournalAttachment[];
}

const getFileIcon = (mimeType?: string, fileName?: string) => {
  const norm = (mimeType || fileName || '').toLowerCase();
  if (norm.includes('pdf')) return <IconFileTypePdf size={22} />;
  if (
    norm.includes('image') ||
    norm.includes('png') ||
    norm.includes('jpg') ||
    norm.includes('jpeg')
  ) {
    return <IconPhoto size={22} />;
  }
  return <IconFileText size={22} />;
};

const JournalAttachments: React.FC<JournalAttachmentsProps> = ({ attachments }) => {
  const { t } = useTranslation('journalEntries');
  if (!attachments || attachments.length === 0) {
    return (
      <Paper withBorder p="md" radius="md" bg="gray.0" ta="center">
        <Text size="sm" c="dimmed">
          {t('attachments.empty')}
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="xs">
      {attachments.map((attachment, index) => {
        const fullUrl = attachment.filePath?.startsWith('http')
          ? attachment.filePath
          : `/${attachment.filePath?.replace(/^\//, '')}`;

        return (
          <Paper
            key={attachment.id || `att-${index}`}
            withBorder
            p="sm"
            radius="md"
            bg="white"
            style={{ transition: 'background-color 150ms ease' }}
          >
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon size={38} radius="md" variant="light" color="primary">
                  {getFileIcon(attachment.mimeType, attachment.fileName)}
                </ThemeIcon>

                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} c="dark.8" truncate maw={{ base: 220, sm: 380 }}>
                    {attachment.fileName || t('attachments.defaultName')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {attachment.mimeType || t('attachments.defaultType')}
                  </Text>
                </Box>
              </Group>

              <Group gap="xs" wrap="nowrap">
                {attachment.filePath && (
                  <Tooltip label={t('attachments.viewTooltip')} withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="md"
                      onClick={() => window.open(fullUrl, '_blank')}
                      aria-label={t('attachments.viewLabel')}
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}

                {attachment.filePath && (
                  <Tooltip label={t('attachments.downloadTooltip')} withArrow>
                    <ActionIcon
                      variant="light"
                      color="primary"
                      size="md"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fullUrl;
                        link.download = attachment.fileName || 'attachment';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      aria-label={t('attachments.downloadLabel')}
                    >
                      <IconDownload size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default JournalAttachments;
