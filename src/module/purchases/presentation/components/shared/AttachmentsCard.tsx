import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  FileButton,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconDownload,
  IconEye,
  IconFile,
  IconPaperclip,
  IconShare,
  IconUpload,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Attachment } from '@/module/purchases/domain/purchaseCommon';
import type {
  AttachmentTarget,
  RequestFileTarget,
} from '@/module/purchases/infrastructure/purchaseApi';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { useUploadAttachments } from '@/module/purchases/presentation/hooks/usePurchaseMutations';

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

interface AttachmentsCardProps {
  target: AttachmentTarget;
  documentId: string;
  attachments: Attachment[];
  /** The user may change the document (adds files). */
  canUpload: boolean;
  /** On an FPPBJ: files of the request or of its IOM memo. */
  requestFile?: RequestFileTarget;
  /** Translation key of the card title; defaults to the generic attachments title. */
  titleKey?: string;
  /** Translation key of the subtitle; defaults to the upload limit. */
  subtitleKey?: string;
  /** Show a file count in the card header. */
  showCount?: boolean;
  /** Use the reference file row with preview, download and share actions. */
  showFileActions?: boolean;
  /** Without its own card, to sit inside another card; the title becomes a plain heading. */
  bare?: boolean;
}

/** Files on a document; up to 5 files of 5 MB each can be added. */
export const AttachmentsCard = ({
  target,
  documentId,
  attachments,
  canUpload,
  requestFile,
  titleKey = 'attachments.title',
  subtitleKey = 'attachments.limit',
  showCount = false,
  showFileActions = false,
  bare,
}: Readonly<AttachmentsCardProps>) => {
  const { t } = useTranslation('purchases');
  const upload = useUploadAttachments();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    if (attachments.length + files.length > MAX_FILES) {
      notifications.show({
        color: 'orange',
        message: t('attachments.tooMany', { max: MAX_FILES }),
      });
      return;
    }
    if (files.some((file) => file.size > MAX_BYTES)) {
      notifications.show({ color: 'orange', message: t('attachments.tooLarge') });
      return;
    }
    upload.mutate({ target, id: documentId, files, requestFile });
  };

  const shareFile = async (file: Attachment) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: file.name, url: file.url });
      } else {
        await navigator.clipboard.writeText(file.url);
        notifications.show({ color: 'teal', message: t('attachments.linkCopied') });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notifications.show({ color: 'orange', message: t('attachments.shareFailed') });
    }
  };

  const body = (
    <>
      {attachments.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('attachments.empty')}
        </Text>
      ) : (
        <Stack gap={6}>
          {attachments.map((file) =>
            showFileActions ? (
              <Paper key={file.id} withBorder radius="md" p="sm">
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <ThemeIcon variant="light" color="primary" radius="md" size={42}>
                      <IconFile size={20} />
                    </ThemeIcon>
                    <div style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} truncate>
                        {file.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {file.mimeType === 'application/pdf'
                          ? 'PDF'
                          : (file.mimeType.split('/').at(-1) ?? '').toUpperCase()}
                      </Text>
                      {file.kind !== 'OTHER' && file.kindLabel && (
                        <Badge variant="light" radius="sm" size="sm" mt={4}>
                          {file.kindLabel}
                        </Badge>
                      )}
                    </div>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    <Tooltip label={t('attachments.preview')}>
                      <ActionIcon
                        component="a"
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        variant="default"
                        radius="md"
                        aria-label={t('attachments.preview')}
                      >
                        <IconEye size={17} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('attachments.download')}>
                      <ActionIcon
                        component="a"
                        href={file.url}
                        download={file.name}
                        variant="default"
                        radius="md"
                        aria-label={t('attachments.download')}
                      >
                        <IconDownload size={17} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('attachments.share')}>
                      <ActionIcon
                        variant="default"
                        radius="md"
                        aria-label={t('attachments.share')}
                        onClick={async () => shareFile(file)}
                      >
                        <IconShare size={17} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>
            ) : (
              <Group key={file.id} gap={8} wrap="nowrap">
                <IconPaperclip size={14} />
                <Anchor href={file.url} target="_blank" rel="noreferrer" size="sm" truncate>
                  {file.name}
                </Anchor>
                {file.kind !== 'OTHER' && file.kindLabel && (
                  <Badge variant="light" radius="sm" size="sm" style={{ flexShrink: 0 }}>
                    {file.kindLabel}
                  </Badge>
                )}
              </Group>
            )
          )}
        </Stack>
      )}
      {canUpload && (
        <FileButton
          onChange={handleFiles}
          multiple
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
        >
          {(props) => (
            <Button
              {...props}
              variant="light"
              fullWidth
              leftSection={<IconUpload size={14} />}
              loading={upload.isPending}
              disabled={attachments.length >= MAX_FILES}
            >
              {t('attachments.add')}
            </Button>
          )}
        </FileButton>
      )}
    </>
  );
  if (bare) {
    return (
      <Stack gap={6}>
        <div>
          <Text size="sm" fw={600}>
            {t(titleKey)}
          </Text>
          <Text size="xs" c="dimmed">
            {t('attachments.limit')}
          </Text>
        </div>
        {body}
      </Stack>
    );
  }
  return (
    <SectionCard
      icon={IconPaperclip}
      title={t(titleKey)}
      subtitle={t(subtitleKey)}
      count={showCount ? t('attachments.count', { count: attachments.length }) : undefined}
    >
      {body}
    </SectionCard>
  );
};
