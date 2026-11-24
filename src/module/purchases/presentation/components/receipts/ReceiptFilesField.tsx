import { Text } from '@mantine/core';
import { MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import { useTranslation } from '@/i18n';
import { RECEIPT_MAX_FILES } from '@/module/purchases/domain/receiptForm';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = [MIME_TYPES.pdf, MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.doc, MIME_TYPES.docx];

interface ReceiptFilesFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
  /** Show that the signed file is missing. */
  error?: boolean;
}

/** The signed BAPP, picked now and sent together with the receipt (1 to 5 files of 5 MB). */
export const ReceiptFilesField = ({
  files,
  onChange,
  error = false,
}: Readonly<ReceiptFilesFieldProps>) => {
  const { t } = useTranslation('purchases');

  const add = (dropped: File[]) => {
    const next = [...files, ...dropped.filter((file) => !files.some((f) => f.name === file.name))];
    if (next.length > RECEIPT_MAX_FILES) {
      notifications.show({
        color: 'orange',
        message: t('attachments.tooMany', { max: RECEIPT_MAX_FILES }),
      });
      return;
    }
    onChange(next);
  };

  return (
    <>
      <CustomDropzone
        title={`${t('receipts.form.files.title')} *`}
        description={t('receipts.form.files.drop')}
        subDescription={t('receipts.form.files.hint')}
        accept={ACCEPT}
        maxSize={MAX_BYTES}
        files={files}
        uploadedTitle={t('receipts.form.files.chosen')}
        handleDrop={add}
        onReject={() => notifications.show({ color: 'orange', message: t('attachments.tooLarge') })}
        onRemoveFile={(name) => onChange(files.filter((file) => file.name !== name))}
      />
      {error && (
        <Text size="xs" c="red" mt={6} role="alert">
          {t('receipts.form.files.required')}
        </Text>
      )}
    </>
  );
};
