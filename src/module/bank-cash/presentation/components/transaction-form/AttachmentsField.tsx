import { ActionIcon, Box, Group, Stack, Text } from '@mantine/core';
import { IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconFileText, IconPaperclip, IconTrash } from '@tabler/icons-react';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import { useTranslation } from '@/i18n';
import {
  MAX_ATTACHMENT_BYTES,
  addAttachments,
  formatFileSize,
  removeAttachment,
} from '@/module/bank-cash/domain/attachments';
import { FormSection } from '@/module/bank-cash/presentation/components/transaction-form/FormSection';

/** Optional proof documents of a posting form: the drop area, then the chosen files, each removable. */
export function AttachmentsField({
  files,
  onChange,
}: Readonly<{ files: File[]; onChange: (files: File[]) => void }>) {
  const { t } = useTranslation('bankCash');

  return (
    <FormSection
      icon={<IconPaperclip size={18} />}
      title={t('form.attachments.title')}
      hint={t('form.attachments.hint')}
    >
      <CustomDropzone
        title=""
        showUploadedFiles={false}
        maxSize={MAX_ATTACHMENT_BYTES}
        accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
        handleDrop={(dropped) => onChange(addAttachments(files, dropped))}
        onReject={() =>
          notifications.show({
            color: 'red',
            title: t('form.attachments.rejectedTitle'),
            message: t('form.attachments.rejectedMessage'),
          })
        }
        description={
          <>
            <Text span display="block" ta="center" fz="sm" fw={600} c="dark.8">
              {t('form.attachments.drop')}
            </Text>
            <Text span display="block" ta="center" fz={12} c="dimmed">
              {t('form.attachments.dropHint')}
            </Text>
          </>
        }
      />

      {files.length > 0 && (
        <Stack gap="xs">
          {files.map((file, index) => (
            <Group
              key={`${file.name}-${file.size}`}
              justify="space-between"
              wrap="nowrap"
              p="xs"
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <IconFileText size={20} color="var(--mantine-color-dimmed)" />
                <Box style={{ minWidth: 0 }}>
                  <Text fz="sm" fw={500} truncate>
                    {file.name}
                  </Text>
                  <Text fz={12} c="dimmed">
                    {formatFileSize(file.size)}
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => onChange(removeAttachment(files, index))}
                aria-label={t('form.attachments.remove', { name: file.name })}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}
    </FormSection>
  );
}
