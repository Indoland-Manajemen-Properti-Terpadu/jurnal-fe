import { Anchor, Badge, Button, FileButton, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPaperclip, IconUpload } from '@tabler/icons-react';
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
  bare,
}: Readonly<AttachmentsCardProps>) => {
  const { t } = useTranslation('purchases');
  const upload = useUploadAttachments();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    if (files.length > MAX_FILES || files.some((file) => file.size > MAX_BYTES)) {
      notifications.show({ color: 'orange', message: t('attachments.tooLarge') });
      return;
    }
    upload.mutate({ target, id: documentId, files, requestFile });
  };

  const body = (
    <>
      {attachments.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('attachments.empty')}
        </Text>
      ) : (
        <Stack gap={6}>
          {attachments.map((file) => (
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
          ))}
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
    <SectionCard icon={IconPaperclip} title={t(titleKey)} subtitle={t('attachments.limit')}>
      {body}
    </SectionCard>
  );
};
