import { useRef, useState } from 'react';
import { ActionIcon, Anchor, Box, FileButton, Button, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPaperclip, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type {
  PettyCashFund,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import { ATTACHMENT_TYPES, validateAttachmentFiles } from '@/module/petty-cash/domain/voucherForm';
import { AttachmentDeleteDialog } from '@/module/petty-cash/presentation/components/AttachmentDeleteDialog';
import { useAllowedVoucherActions } from '@/module/petty-cash/presentation/hooks/useAllowedVoucherActions';
import { useOpenAttachment } from '@/module/petty-cash/presentation/hooks/useOpenAttachment';
import {
  useDeleteVoucherAttachment,
  useUploadVoucherAttachments,
} from '@/module/petty-cash/presentation/hooks/useVoucherMutations';

interface Props {
  voucher: PettyCashVoucherRecord;
  fund: PettyCashFund;
}

/** Receipts of one voucher: open each through its signed link, add or delete while the status allows. */
export function VoucherAttachmentsPanel({ voucher, fund }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const { open, openingId } = useOpenAttachment();
  const allowed = useAllowedVoucherActions(voucher, fund);
  const upload = useUploadVoucherAttachments(voucher.id);
  const remove = useDeleteVoucherAttachment(voucher.id);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
  const resetRef = useRef<() => void>(null);

  const onPick = (files: File[]) => {
    // Without a reset the browser would not fire a change for the same file picked again.
    resetRef.current?.();
    const issues = validateAttachmentFiles(files, voucher.attachments.length);
    if (issues.length > 0) {
      notifications.show({
        color: 'red',
        message: issues
          .map((issue) => t(`form.fileIssues.${issue.code}`, { name: issue.name }))
          .join(' '),
      });
      return;
    }
    upload.mutate({ files });
  };

  return (
    <Box>
      <Text fw={700} mb="xs">
        {t('drawer.attachments')}
      </Text>
      {voucher.attachments.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('drawer.noAttachments')}
        </Text>
      ) : (
        <Stack gap={6}>
          {voucher.attachments.map((attachment) => (
            <Group key={attachment.id} justify="space-between" wrap="nowrap" gap="xs">
              <Anchor
                component="button"
                type="button"
                size="sm"
                ta="left"
                disabled={openingId === attachment.id}
                onClick={() => open(attachment.id)}
                aria-label={t('drawer.openAttachment', { name: attachment.fileName })}
              >
                <Group gap={6} wrap="nowrap">
                  <IconPaperclip size={14} />
                  {attachment.fileName}
                </Group>
              </Anchor>
              {allowed.includes('deleteAttachment') && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  disabled={remove.isPending}
                  aria-label={t('actions.deleteAttachment', { name: attachment.fileName })}
                  onClick={() => setToDelete({ id: attachment.id, name: attachment.fileName })}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              )}
            </Group>
          ))}
          <Text size="xs" c="dimmed">
            {t('drawer.attachmentLinkNote')}
          </Text>
        </Stack>
      )}
      {allowed.includes('uploadAttachment') && (
        <FileButton
          resetRef={resetRef}
          onChange={onPick}
          accept={ATTACHMENT_TYPES.join(',')}
          multiple
        >
          {(props) => (
            <Button
              {...props}
              mt="sm"
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              loading={upload.isPending}
            >
              {t('actions.addAttachment')}
            </Button>
          )}
        </FileButton>
      )}
      <AttachmentDeleteDialog
        fileName={toDelete?.name ?? null}
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          remove.mutate({ attachmentId: toDelete.id }, { onSettled: () => setToDelete(null) })
        }
      />
    </Box>
  );
}
