import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  IconBuildingWarehouse,
  IconCash,
  IconFileDescription,
  IconFileTypePdf,
  IconPaperclip,
  IconPlus,
  IconSignature,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { WriteOffReport, WriteOffSignature } from '@/module/assets/domain/writeOff';
import { WRITE_OFF_LIMITS } from '@/module/assets/domain/writeOffRules';
import { AssetFact, AssetFactGrid } from '@/module/assets/presentation/components/AssetFacts';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { WriteOffEvidenceDropzone } from '@/module/assets/presentation/components/WriteOffEvidenceDropzone';
import classes from '@/module/assets/presentation/components/WriteOffDetail.module.css';
import { useAddWriteOffAttachments } from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { useDecimalPrecision } from '@/module/settings';

type Props = { report: WriteOffReport };

/** The asset as it was when the report was filed. */
export function WriteOffAssetCard({ report }: Readonly<Props>) {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const { snapshot } = report;
  const brandModel = [snapshot.brand, snapshot.modelType].filter(Boolean).join(' / ');
  return (
    <AssetCard icon={IconBuildingWarehouse} title={t('cardAsset')} subtitle={t('cardAssetSub')}>
      <AssetFactGrid>
        <AssetFact label={t('docAsset')} value={snapshot.name} />
        <AssetFact label={t('docCode')} value={snapshot.code} />
        <AssetFact label={t('docCategory')} value={snapshot.categoryName} emptyText="—" />
        <AssetFact label={t('docLocation')} value={snapshot.location} emptyText="—" />
        <AssetFact label={t('docBrandModel')} value={brandModel} emptyText="—" />
        <AssetFact label={t('docSerial')} value={snapshot.serialNumber} emptyText="—" />
        <AssetFact label={t('docAcquired')} value={formatAssetDate(snapshot.acquisitionDate)} />
        <AssetFact
          label={t('acquisitionCost')}
          value={formatAssetMoney(snapshot.acquisitionCost, precision)}
          numeric
        />
      </AssetFactGrid>
    </AssetCard>
  );
}

/** What happened, in the submitter's words. */
export function WriteOffChronologyCard({ report }: Readonly<Props>) {
  const { t } = useTranslation('assetWriteOffs');
  return (
    <AssetCard
      icon={IconFileDescription}
      title={t('docChronology')}
      subtitle={`${t('docIncidentDate')}: ${formatAssetDate(report.incidentDate)}`}
    >
      <Text size="sm" className={classes.chronology}>
        {report.description}
      </Text>
    </AssetCard>
  );
}

function MoneyRow({
  label,
  value,
  total,
}: Readonly<{ label: string; value: string; total?: boolean }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text fz="sm" fw={total ? 700 : 400} c={total ? undefined : 'dimmed'}>
        {label}
      </Text>
      <Text className={classes.numeric} fz={total ? 'lg' : 'sm'} fw={total ? 700 : 500}>
        {value}
      </Text>
    </Group>
  );
}

/** Book value, money received and the gain or loss: the booked figures once approved. */
export function WriteOffValuesCard({ report }: Readonly<Props>) {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const money = (value: number) => formatAssetMoney(value, precision);
  const booked = report.result;
  const accumulated = booked?.accumulatedDepreciation ?? report.snapshot.accumulatedDepreciation;
  const bookValue = booked?.bookValue ?? report.snapshot.bookValue;
  const gainLoss = booked?.gainLoss ?? report.snapshot.estimatedGainLoss;
  const resultLabel = gainLoss > 0 ? t('gain') : gainLoss < 0 ? t('loss') : t('breakEven');
  const estimate = !booked && report.status === 'PENDING_APPROVAL';

  return (
    <AssetCard
      icon={IconCash}
      title={t('docFigures')}
      subtitle={
        estimate
          ? t('docFiguresEstimate')
          : report.status === 'APPROVED'
            ? t('docFiguresBooked')
            : t('docFiguresNotBooked')
      }
    >
      <Stack gap="xs">
        <MoneyRow label={t('acquisitionCost')} value={money(report.snapshot.acquisitionCost)} />
        <MoneyRow label={t('accumulated')} value={money(accumulated)} />
        <MoneyRow label={t('bookValue')} value={money(bookValue)} />
        <MoneyRow
          label={
            report.proceedsAccount
              ? `${t('received')} · ${report.proceedsAccount.accountNumber} ${report.proceedsAccount.name}`
              : t('received')
          }
          value={money(report.proceedsAmount)}
        />
        <Divider my={4} />
        <MoneyRow label={resultLabel} value={money(Math.abs(gainLoss))} total />
      </Stack>
    </AssetCard>
  );
}

/** Photos and documents behind the report; more can be added while it waits. */
export function WriteOffEvidenceCard({ report }: Readonly<Props>) {
  const { t } = useTranslation('assetWriteOffs');
  const [adding, setAdding] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const add = useAddWriteOffAttachments(report.id);
  const room = WRITE_OFF_LIMITS.maxFiles - report.attachments.length;
  const canAdd = report.status === 'PENDING_APPROVAL' && room > 0;

  const close = () => {
    setAdding(false);
    setFiles([]);
  };
  const save = async () => {
    try {
      await add.mutateAsync(files);
      close();
    } catch {
      // The mutation shows the failure; the chosen files stay.
    }
  };

  return (
    <AssetCard
      icon={IconPaperclip}
      title={t('docEvidence')}
      subtitle={t('fileCount', {
        count: report.attachments.length,
        max: WRITE_OFF_LIMITS.maxFiles,
      })}
      right={
        canAdd && (
          <Button
            variant="default"
            size="xs"
            radius="md"
            leftSection={<IconPlus size={14} />}
            onClick={() => setAdding(true)}
          >
            {t('addEvidence')}
          </Button>
        )
      }
    >
      {report.attachments.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('docEvidenceEmpty')}
        </Text>
      ) : (
        <div className={classes.files}>
          {report.attachments.map((file) => {
            const image = file.mimeType.startsWith('image/');
            return (
              <UnstyledButton
                key={file.id}
                component="a"
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className={classes.file}
                aria-label={t('openFile', { name: file.fileName })}
              >
                {image ? (
                  <Image src={file.url} alt="" className={classes.thumb} />
                ) : (
                  <Box className={classes.thumb} data-pdf>
                    <IconFileTypePdf size={26} stroke={1.6} />
                  </Box>
                )}
                <Text size="xs" c="dimmed" truncate title={file.fileName}>
                  {file.fileName}
                </Text>
              </UnstyledButton>
            );
          })}
        </div>
      )}

      <Modal
        opened={adding}
        onClose={close}
        centered
        radius="lg"
        size="lg"
        title={t('addEvidence')}
      >
        <Stack gap="md">
          <WriteOffEvidenceDropzone
            files={files}
            onChange={setFiles}
            existingCount={report.attachments.length}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" radius="md" onClick={close} disabled={add.isPending}>
              {t('cancel')}
            </Button>
            <Button
              radius="md"
              disabled={files.length === 0}
              loading={add.isPending}
              onClick={save}
            >
              {t('addEvidence')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AssetCard>
  );
}

function SignatureBlock({ signature }: Readonly<{ signature: WriteOffSignature }>) {
  const { t } = useTranslation('assetWriteOffs');
  return (
    <div className={classes.signature}>
      <Text fz="xs" c="dimmed" fw={600}>
        {signature.title}
      </Text>
      <div className={classes.ink}>
        {signature.state === 'signed' && signature.imageUrl && (
          <Image
            src={signature.imageUrl}
            alt={signature.name ?? signature.title}
            fit="contain"
            h={56}
          />
        )}
        {signature.state === 'signed' && !signature.imageUrl && (
          <Text size="xs" c="dimmed">
            {t('eSigned')}
          </Text>
        )}
        {signature.state === 'waiting' && (
          <Text size="xs" c="dimmed">
            {t('docWaiting')}
          </Text>
        )}
        {signature.state === 'rejected' && (
          <Text size="xs" c="dimmed">
            {t('signatureRejected')}
          </Text>
        )}
      </div>
      <Text size="sm" fw={600}>
        {signature.name ?? '—'}
      </Text>
      <Text size="xs" c="dimmed">
        {signature.role}
        {signature.signedAt ? ` · ${formatAssetDate(signature.signedAt)}` : ''}
      </Text>
    </div>
  );
}

/** The signatures as they appear on the printed report. */
export function WriteOffSignaturesCard({ report }: Readonly<Props>) {
  const { t } = useTranslation('assetWriteOffs');
  return (
    <AssetCard icon={IconSignature} title={t('cardSignatures')} subtitle={t('cardSignaturesSub')}>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        {report.signatures.map((signature, index) => (
          <SignatureBlock key={`${signature.title}-${index}`} signature={signature} />
        ))}
      </SimpleGrid>
    </AssetCard>
  );
}
