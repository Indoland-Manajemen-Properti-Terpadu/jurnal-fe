import { ActionIcon, Anchor, Badge, Button, FileButton, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPaperclip, IconTrash, IconUpload } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Attachment } from '@/module/purchases/domain/purchaseCommon';

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

interface PaymentRequestProformaFilesProps {
  attachments: Attachment[];
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

/** Proforma files are included on create or uploaded to an existing draft before submission. */
export const PaymentRequestProformaFiles = ({
  attachments,
  files,
  onChange,
  error,
}: Readonly<PaymentRequestProformaFilesProps>) => {
  const { t } = useTranslation('purchases');

  const addFiles = (selected: File[]) => {
    const unique = selected.filter(
      (file) =>
        !attachments.some((attachment) => attachment.name === file.name) &&
        !files.some((item) => item.name === file.name)
    );
    if (attachments.length + files.length + unique.length > MAX_FILES) {
      notifications.show({
        color: 'orange',
        message: t('attachments.tooMany', { max: MAX_FILES }),
      });
      return;
    }
    if (unique.some((file) => file.size > MAX_BYTES)) {
      notifications.show({ color: 'orange', message: t('attachments.tooLarge') });
      return;
    }
    onChange([...files, ...unique]);
  };

  return (
    <Stack gap="xs">
      <div>
        <Group gap={6} mb={4}>
          <Text size="sm" fw={600}>
            {t('paymentRequests.form.proformaTitle')}
          </Text>
          <Badge size="xs" variant="light" color="red">
            {t('paymentRequests.form.requiredBeforeSubmit')}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {t('paymentRequests.form.proformaHint')}
        </Text>
      </div>

      {attachments.map((attachment) => (
        <Group key={attachment.id} gap="xs" wrap="nowrap">
          <IconPaperclip size={14} />
          <Anchor href={attachment.url} target="_blank" rel="noreferrer" size="sm" truncate>
            {attachment.name}
          </Anchor>
        </Group>
      ))}

      {files.map((file) => (
        <Group key={`${file.name}-${file.lastModified}`} justify="space-between" wrap="nowrap">
          <Text size="sm" truncate>
            {file.name}
          </Text>
          <ActionIcon
            aria-label={t('paymentRequests.form.removeProforma', { name: file.name })}
            variant="subtle"
            color="red"
            onClick={() => onChange(files.filter((item) => item !== file))}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}

      {attachments.length + files.length < MAX_FILES && (
        <FileButton
          onChange={(selected) => addFiles(selected ?? [])}
          multiple
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
        >
          {(props) => (
            <Button {...props} variant="light" leftSection={<IconUpload size={14} />}>
              {t('attachments.add')}
            </Button>
          )}
        </FileButton>
      )}
      {error && (
        <Text size="xs" c="red" role="alert">
          {error}
        </Text>
      )}
    </Stack>
  );
};
