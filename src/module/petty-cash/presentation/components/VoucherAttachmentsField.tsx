import { useRef } from 'react';
import { ActionIcon, Anchor, Button, FileButton, Group, Stack, Text } from '@mantine/core';
import { IconPaperclip, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Attachment } from '@/module/petty-cash/domain/pettyCashEntities';
import { ATTACHMENT_TYPES } from '@/module/petty-cash/domain/voucherForm';

interface Props {
  /** Receipts already stored on the voucher (edit only). */
  existing: Attachment[];
  files: File[];
  error?: string;
  onChange: (files: File[]) => void;
  onOpenExisting?: (attachmentId: string) => void;
  onDeleteExisting?: (attachmentId: string) => void;
}

/** Receipts picked on the form; stored ones are listed apart so it is clear what will be uploaded. */
export function VoucherAttachmentsField({
  existing,
  files,
  error,
  onChange,
  onOpenExisting,
  onDeleteExisting,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const resetRef = useRef<() => void>(null);

  return (
    <Stack gap="sm">
      {existing.length > 0 && (
        <Stack gap={4}>
          <Text size="xs" c="dimmed" fw={600}>
            {t('form.attachmentsExisting')}
          </Text>
          {existing.map((attachment) => (
            <Group key={attachment.id} justify="space-between" wrap="nowrap">
              <Anchor
                component="button"
                type="button"
                size="sm"
                onClick={() => onOpenExisting?.(attachment.id)}
                aria-label={t('drawer.openAttachment', { name: attachment.fileName })}
              >
                <Group gap={6} wrap="nowrap">
                  <IconPaperclip size={14} />
                  {attachment.fileName}
                </Group>
              </Anchor>
              {onDeleteExisting && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  aria-label={t('actions.deleteAttachment', { name: attachment.fileName })}
                  onClick={() => onDeleteExisting(attachment.id)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              )}
            </Group>
          ))}
        </Stack>
      )}
      {files.length > 0 && (
        <Stack gap={4}>
          <Text size="xs" c="dimmed" fw={600}>
            {t('form.attachmentsNew')}
          </Text>
          {files.map((file, index) => (
            <Group
              key={`${file.name}-${file.lastModified}-${index}`}
              justify="space-between"
              wrap="nowrap"
            >
              <Group gap={6} wrap="nowrap">
                <IconPaperclip size={14} />
                <Text size="sm">{file.name}</Text>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label={t('form.attachmentRemove', { name: file.name })}
                onClick={() => onChange(files.filter((_, position) => position !== index))}
              >
                <IconX size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}
      {files.length === 0 && existing.length === 0 && (
        <Text size="sm" c="dimmed">
          {t('form.attachmentsPlaceholder')}
        </Text>
      )}
      {error && (
        <Text size="sm" c="red.7" role="alert">
          {error}
        </Text>
      )}
      <FileButton
        resetRef={resetRef}
        onChange={(picked) => {
          onChange([...files, ...picked]);
          resetRef.current?.();
        }}
        accept={ATTACHMENT_TYPES.join(',')}
        multiple
      >
        {(props) => (
          <Button
            {...props}
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('form.attachmentsChoose')}
          </Button>
        )}
      </FileButton>
    </Stack>
  );
}
