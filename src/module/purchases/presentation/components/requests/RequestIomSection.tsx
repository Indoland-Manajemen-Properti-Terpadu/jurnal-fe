import { Anchor, Grid, Group, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFileDescription, IconPaperclip } from '@tabler/icons-react';
import { MIME_TYPES } from '@mantine/dropzone';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import { useTranslation } from '@/i18n';
import type { Attachment } from '@/module/purchases/domain/purchaseCommon';
import {
  REQUEST_LIMITS,
  type RequestFormErrors,
  type RequestFormValues,
} from '@/module/purchases/domain/requestForm';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = [
  MIME_TYPES.pdf,
  MIME_TYPES.doc,
  MIME_TYPES.docx,
  MIME_TYPES.xls,
  MIME_TYPES.xlsx,
  MIME_TYPES.png,
  MIME_TYPES.jpeg,
];

interface RequestIomSectionProps {
  values: RequestFormValues;
  errors: RequestFormErrors;
  showErrors: boolean;
  /** Files already stored on the request (edit). */
  stored: Attachment[];
  /** Files chosen now; they are sent once the request is saved. */
  files: File[];
  onChange: <K extends keyof RequestFormValues>(key: K, value: RequestFormValues[K]) => void;
  onFilesChange: (files: File[]) => void;
}

/** The optional Internal Office Memo: number, date and the memo files. A request needs no IOM. */
export const RequestIomSection = ({
  values,
  errors,
  showErrors,
  stored,
  files,
  onChange,
  onFilesChange,
}: Readonly<RequestIomSectionProps>) => {
  const { t } = useTranslation('purchases');

  const add = (dropped: File[]) => {
    const next = [...files, ...dropped.filter((file) => !files.some((f) => f.name === file.name))];
    if (stored.length + next.length > MAX_FILES) {
      notifications.show({
        color: 'orange',
        message: t('attachments.tooMany', { max: MAX_FILES }),
      });
      return;
    }
    onFilesChange(next);
  };

  return (
    <SectionCard
      icon={IconFileDescription}
      title={t('requests.form.iomTitle')}
      subtitle={t('requests.form.iomSubtitle')}
    >
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            radius="md"
            label={t('requests.form.iomNumber')}
            placeholder={t('requests.form.iomNumberPlaceholder')}
            value={values.iomNumber}
            onChange={(event) => onChange('iomNumber', event.currentTarget.value)}
            error={
              showErrors && errors.iomNumber
                ? t('requests.form.iomNumberError', { max: REQUEST_LIMITS.iomNumber })
                : undefined
            }
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateField
            clearable
            label={t('requests.form.iomDate')}
            value={values.iomDate}
            onChange={(value) => onChange('iomDate', value)}
          />
        </Grid.Col>
      </Grid>
      {stored.length > 0 && (
        <Stack gap={6}>
          <Text size="xs" c="dimmed" fw={500}>
            {t('requests.form.iomStored')}
          </Text>
          {stored.map((file) => (
            <Group key={file.id} gap={8} wrap="nowrap">
              <IconPaperclip size={14} />
              <Anchor href={file.url} target="_blank" rel="noreferrer" size="sm" truncate>
                {file.name}
              </Anchor>
            </Group>
          ))}
        </Stack>
      )}
      <CustomDropzone
        title={t('requests.form.iomUpload')}
        description={t('requests.form.iomDrop')}
        subDescription={t('requests.form.iomDropHint')}
        accept={ACCEPT}
        maxSize={MAX_BYTES}
        files={files}
        uploadedTitle={t('requests.form.iomChosen')}
        handleDrop={add}
        onReject={() => notifications.show({ color: 'orange', message: t('attachments.tooLarge') })}
        onRemoveFile={(name) => onFilesChange(files.filter((file) => file.name !== name))}
      />
    </SectionCard>
  );
};
