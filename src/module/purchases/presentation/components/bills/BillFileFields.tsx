import { Grid } from '@mantine/core';
import { MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import { useTranslation } from '@/i18n';

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

export interface BillFiles {
  invoice: File[];
  tax: File[];
}

interface BillFileFieldsProps {
  files: BillFiles;
  onChange: (files: BillFiles) => void;
}

/** The vendor's invoice and the tax invoice, picked now and sent once the bill is saved. */
export const BillFileFields = ({ files, onChange }: Readonly<BillFileFieldsProps>) => {
  const { t } = useTranslation('purchases');
  const field = (key: keyof BillFiles) => (
    <Grid.Col span={{ base: 12, md: 6 }} key={key}>
      <CustomDropzone
        title={t(`bills.form.file.${key}`)}
        description={t('bills.form.file.drop')}
        subDescription={t('bills.form.file.hint')}
        accept={ACCEPT}
        maxSize={MAX_BYTES}
        files={files[key]}
        uploadedTitle={t('bills.form.file.chosen')}
        // One file per field: a new one replaces the one chosen before.
        handleDrop={(dropped) => dropped[0] && onChange({ ...files, [key]: [dropped[0]] })}
        multiple={false}
        onReject={() => notifications.show({ color: 'orange', message: t('attachments.tooLarge') })}
        onRemoveFile={(name) =>
          onChange({ ...files, [key]: files[key].filter((file) => file.name !== name) })
        }
      />
    </Grid.Col>
  );
  return (
    <Grid gutter="md" mt="md">
      {field('invoice')}
      {field('tax')}
    </Grid>
  );
};
