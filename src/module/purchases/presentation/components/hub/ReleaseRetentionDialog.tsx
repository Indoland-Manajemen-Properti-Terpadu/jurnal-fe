import { useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import { validateRetentionRelease } from '@/module/purchases/domain/retention';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import {
  formatAmount,
  formatDay,
  fromIsoDay,
  todayIso,
} from '@/module/purchases/presentation/components/shared/format';
import {
  useReleaseRetention,
  useRetentionPreview,
  useRetentionReport,
} from '@/module/purchases/presentation/hooks/useRetention';
import { routes } from '@/router/routes';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = [MIME_TYPES.pdf, MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.doc, MIME_TYPES.docx];

interface ReleaseRetentionDialogProps {
  purchaseOrderId: string;
  onClose: () => void;
}

const SummaryRow = ({
  label,
  value,
  color,
  strong = false,
}: Readonly<{ label: string; value: string; color?: string; strong?: boolean }>) => (
  <Group justify="space-between" wrap="nowrap" gap="md">
    <Text fz="xs" c="slate.7">
      {label}
    </Text>
    <Text fz="xs" fw={700} c={color ?? (strong ? 'primary.9' : undefined)}>
      {value}
    </Text>
  </Group>
);

/**
 * Releasing held retention (PRO-128): the final handover number, the date and the signed file. The
 * service books Hutang Retensi against Hutang PPh and Hutang Usaha and makes a verified bill.
 */
export const ReleaseRetentionDialog = ({
  purchaseOrderId,
  onClose,
}: Readonly<ReleaseRetentionDialogProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const navigate = useNavigate();
  const report = useRetentionReport();
  const preview = useRetentionPreview(purchaseOrderId);
  const release = useReleaseRetention((bill) => {
    onClose();
    navigate(routes.purchases.billDetail.replace(':id', bill.id));
  });
  const row = report.data?.rows.find((item) => item.purchaseOrderId === purchaseOrderId);

  const [bastNumber, setBastNumber] = useState('');
  const [releaseDate, setReleaseDate] = useState(todayIso());
  const [memo, setMemo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const today = todayIso();
  const releasableFrom = preview.data?.releasableFrom ?? row?.releasableFrom ?? null;
  const issues = validateRetentionRelease(
    { bastNumber, releaseDate, file },
    { balance: row?.balance ?? 0, releasableFrom, today }
  );
  const hasIssues = Object.keys(issues).length > 0;
  const kind = row?.isService === false ? 'Goods' : 'Service';
  const shown = (issue: keyof typeof issues) => showErrors && issues[issue];
  const dateError = (() => {
    if (!showErrors) return undefined;
    if (issues.date) return t('reports.retention.release.error.date');
    if (issues.future) return t('reports.retention.release.error.future');
    if (issues.early) {
return t('reports.retention.release.error.early', {
        date: formatDay(releasableFrom, currentLanguage),
      });
}
    return undefined;
  })();

  const confirm = () => {
    setShowErrors(true);
    if (hasIssues || !row) return;
    release.mutate({ purchaseOrderId, bastNumber, releaseDate, memo, file });
  };

  const pickFile = (dropped: File[]) => setFile(dropped[0] ?? null);

  return (
    <ModalFrame
      opened
      onClose={onClose}
      size={620}
      title={t('reports.retention.release.title')}
      description={
        row
          ? t('reports.retention.release.subtitle', { number: row.number, vendor: row.vendorName })
          : undefined
      }
      footer={
        <>
          <Button variant="default" disabled={release.isPending} onClick={onClose}>
            {t('reports.retention.release.cancel')}
          </Button>
          <Button
            loading={release.isPending}
            disabled={(showErrors && hasIssues) || !row}
            onClick={confirm}
          >
            {t('reports.retention.release.confirm')}
          </Button>
        </>
      }
    >
      {row && (
        <>
          <Stack
            gap={6}
            p="md"
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <SummaryRow
              label={t('reports.retention.release.heldFrom', { percent: row.percent })}
              value={formatAmount(row.held)}
            />
            {row.released > 0 && (
              <SummaryRow
                label={t('reports.retention.release.releasedBefore')}
                value={`-${formatAmount(row.released)}`}
                color="red.7"
              />
            )}
            <SummaryRow
              label={t('reports.retention.release.vat')}
              value={t('reports.retention.release.vatIncluded')}
              color="slate.6"
            />
            <SummaryRow
              label={t('reports.retention.release.withholding', {
                percent: preview.data?.withholdingPercent ?? 0,
              })}
              value={preview.data ? `-${formatAmount(preview.data.withholdingAmount)}` : '-'}
              color="red.7"
            />
            <Divider />
            <SummaryRow
              label={t('reports.retention.release.payable')}
              value={preview.data ? formatAmount(preview.data.finalAmount) : '-'}
              strong
            />
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              radius="md"
              withAsterisk
              label={t(`reports.retention.release.bastLabel${kind}`)}
              description={t(`reports.retention.release.bastHint${kind}`)}
              placeholder={t(`reports.retention.release.bastPlaceholder${kind}`)}
              value={bastNumber}
              maxLength={100}
              error={
                shown('bastNumber') ? t('reports.retention.release.error.bastNumber') : undefined
              }
              onChange={(event) => setBastNumber(event.currentTarget.value)}
            />
            <DateField
              withAsterisk
              label={t('reports.retention.release.date')}
              description={
                releasableFrom
                  ? t('reports.retention.release.dateHint', {
                      months: row.maintenanceMonths,
                      date: formatDay(releasableFrom, currentLanguage),
                    })
                  : undefined
              }
              value={releaseDate}
              maxDate={fromIsoDay(today) ?? undefined}
              error={dateError}
              onChange={setReleaseDate}
            />
            <NumberInput
              radius="md"
              label={t('reports.retention.release.withholdingField')}
              description={t('reports.retention.release.withholdingHint')}
              suffix=" %"
              hideControls
              readOnly
              value={preview.data?.withholdingPercent ?? 0}
            />
          </SimpleGrid>
          <div>
            <CustomDropzone
              title={`${t(`reports.retention.release.file${kind}Label`)} *`}
              description={t('reports.retention.release.fileDrop')}
              subDescription={t('reports.retention.release.fileHint')}
              accept={ACCEPT}
              maxSize={MAX_BYTES}
              multiple={false}
              files={file ? [file] : []}
              uploadedTitle={t('reports.retention.release.fileChosen')}
              handleDrop={pickFile}
              onReject={() =>
                notifications.show({ color: 'orange', message: t('attachments.tooLarge') })
              }
              onRemoveFile={() => setFile(null)}
            />
            {shown('file') && (
              <Text size="xs" c="red" mt={6} role="alert">
                {t('reports.retention.release.error.file')}
              </Text>
            )}
          </div>
          <Textarea
            radius="md"
            autosize
            minRows={2}
            label={t('reports.retention.release.memo')}
            placeholder={t('reports.retention.release.memoPlaceholder')}
            value={memo}
            onChange={(event) => setMemo(event.currentTarget.value)}
          />
          {shown('nothingHeld') && (
            <Text size="xs" c="red.7" role="alert">
              {t('reports.retention.release.error.nothingHeld')}
            </Text>
          )}
          {preview.isError && (
            <Text size="xs" c="red.7" role="alert">
              {t('reports.retention.release.loadFailed')}
            </Text>
          )}
          <Alert
            variant="light"
            color="primary"
            radius="md"
            icon={<IconInfoCircle size={18} />}
            p="sm"
          >
            <Text fz="xs" c="primary.9">
              {t('reports.retention.release.journalNote')}
            </Text>
          </Alert>
        </>
      )}
    </ModalFrame>
  );
};
