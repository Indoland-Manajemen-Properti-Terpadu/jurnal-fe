import { Box, Group, Image, Loader, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconFileTypePdf } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type {
  WriteOffSignature,
  WriteOffSnapshot,
  WriteOffStatus,
} from '@/module/assets/domain/writeOff';
import { AssetIllustration } from '@/module/assets/presentation/components/AssetIllustration';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/WriteOffSheet.module.css';
import { useDecimalPrecision } from '@/module/settings';

export type WriteOffSheetModel = {
  titleKey: string;
  number: string | null;
  status: WriteOffStatus | null;
  snapshot: Pick<
    WriteOffSnapshot,
    | 'code'
    | 'name'
    | 'categoryName'
    | 'location'
    | 'brand'
    | 'modelType'
    | 'serialNumber'
    | 'acquisitionDate'
    | 'acquisitionCost'
  >;
  incidentDate: string;
  description: string;
  figures: {
    bookValue: number;
    catchUp: number;
    received: number;
    gainLoss: number;
    estimate: boolean;
  } | null;
  figuresLoading?: boolean;
  attachments: { name: string; url: string | null; isImage: boolean }[];
  signatures: WriteOffSignature[];
};

function Fact({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  if (!value) return null;
  return (
    <Box>
      <Text className={classes.factLabel}>{label}</Text>
      <Text className={classes.factValue}>{value}</Text>
    </Box>
  );
}

function FigureRow({
  label,
  value,
  strong,
  tone,
}: Readonly<{ label: string; value: string; strong?: boolean; tone?: string }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md" className={strong ? classes.total : ''}>
      <Text size="sm" c={strong ? undefined : 'dimmed'} fw={strong ? 700 : 400}>
        {label}
      </Text>
      <Text size="sm" fw={strong ? 700 : 600} c={tone} className={classes.num}>
        {value}
      </Text>
    </Group>
  );
}

function SignatureBlock({ signature }: Readonly<{ signature: WriteOffSignature }>) {
  const { t } = useTranslation('assetWriteOffs');
  const rejected = signature.state === 'rejected';
  return (
    <Box className={classes.signature} data-state={signature.state}>
      <Text className={classes.factLabel}>{signature.title}</Text>
      <Box className={classes.signatureInk}>
        {signature.state === 'signed' && signature.imageUrl && (
          <Image
            src={signature.imageUrl}
            alt={signature.name ?? signature.title}
            fit="contain"
            h={56}
          />
        )}
        {signature.state === 'signed' && !signature.imageUrl && (
          <Text size="xs" c="dimmed" fs="italic">
            {t('eSigned')}
          </Text>
        )}
        {signature.state === 'waiting' && (
          <Text size="xs" c="dimmed">
            {t('docWaiting')}
          </Text>
        )}
        {rejected && (
          <Text size="xs" c="red.7" fw={700} tt="uppercase">
            {t('stampRejected')}
          </Text>
        )}
      </Box>
      <Text size="sm" fw={600} lh={1.3}>
        {signature.name ?? '—'}
      </Text>
      <Text size="xs" c="dimmed">
        {signature.role}
        {signature.signedAt ? ` · ${formatAssetDate(signature.signedAt)}` : ''}
      </Text>
    </Box>
  );
}

/** The report as a sheet of paper: the same document the PDF prints, filled in live on the form. */
export function WriteOffSheet({ model }: Readonly<{ model: WriteOffSheetModel }>) {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const money = (value: number) => formatAssetMoney(value, precision);
  const { snapshot, figures } = model;
  const brandModel = [snapshot.brand, snapshot.modelType].filter(Boolean).join(' / ');
  const gainLoss = figures?.gainLoss ?? 0;
  const resultLabel = gainLoss > 0 ? t('gain') : gainLoss < 0 ? t('loss') : t('breakEven');
  const resultTone = gainLoss > 0 ? 'teal.8' : gainLoss < 0 ? 'orange.8' : undefined;
  const rejection = model.signatures.find((signature) => signature.state === 'rejected');

  return (
    <Box className={classes.sheet} data-status={model.status ?? 'draft'}>
      {(model.status === 'APPROVED' || model.status === 'REJECTED') && (
        <Box className={classes.stamp} aria-hidden="true">
          <AssetIllustration
            name={model.status === 'APPROVED' ? 'approved' : 'rejected'}
            maxWidth={96}
          />
        </Box>
      )}

      <Stack gap={4} align="center" className={classes.head}>
        <Text className={classes.title}>{t(model.titleKey)}</Text>
        <Text size="xs" c="dimmed">
          {t('docNumber')}: {model.number ?? t('docNumberPending')}
        </Text>
      </Stack>

      <Box className={classes.section}>
        <Text className={classes.sectionTitle}>{t('docAsset')}</Text>
        <Text fw={700} size="sm">
          {snapshot.name}
        </Text>
        <SimpleGrid cols={2} spacing="sm" verticalSpacing={8} mt={8}>
          <Fact label={t('docCode')} value={snapshot.code} />
          <Fact label={t('docCategory')} value={snapshot.categoryName} />
          <Fact label={t('docBrandModel')} value={brandModel} />
          <Fact label={t('docSerial')} value={snapshot.serialNumber} />
          <Fact label={t('docLocation')} value={snapshot.location} />
          <Fact label={t('docAcquired')} value={formatAssetDate(snapshot.acquisitionDate)} />
        </SimpleGrid>
      </Box>

      <Box className={classes.section}>
        <Group justify="space-between" align="baseline">
          <Text className={classes.sectionTitle}>{t('docChronology')}</Text>
          {model.incidentDate && (
            <Text size="xs" c="dimmed">
              {t('docIncidentDate')}: {formatAssetDate(model.incidentDate)}
            </Text>
          )}
        </Group>
        <Text size="sm" className={classes.chronology} c={model.description ? undefined : 'dimmed'}>
          {model.description.trim() || t('docChronologyEmpty')}
        </Text>
      </Box>

      <Box className={classes.section}>
        <Text className={classes.sectionTitle}>{t('docEvidence')}</Text>
        {model.attachments.length === 0 ? (
          <Text size="xs" c="dimmed">
            {t('docEvidenceEmpty')}
          </Text>
        ) : (
          <Group gap={6}>
            {model.attachments.map((file, index) => {
              const thumb =
                file.isImage && file.url ? (
                  <Image src={file.url} alt="" className={classes.thumb} />
                ) : (
                  <Box className={classes.thumb} data-file>
                    <IconFileTypePdf size={20} />
                  </Box>
                );
              return file.url ? (
                <UnstyledButton
                  key={`${file.name}-${index}`}
                  component="a"
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t('openFile', { name: file.name })}
                >
                  {thumb}
                </UnstyledButton>
              ) : (
                <Box key={`${file.name}-${index}`}>{thumb}</Box>
              );
            })}
          </Group>
        )}
      </Box>

      <Box className={classes.section}>
        <Group justify="space-between" align="baseline" mb={6}>
          <Text className={classes.sectionTitle}>{t('docFigures')}</Text>
          {figures?.estimate && (
            <Text size="xs" c="dimmed">
              {t('docFiguresEstimate')}
            </Text>
          )}
        </Group>
        <Stack gap={6} opacity={model.figuresLoading ? 0.6 : 1} aria-busy={model.figuresLoading}>
          <FigureRow label={t('acquisitionCost')} value={money(snapshot.acquisitionCost)} />
          {figures ? (
            <>
              {figures.catchUp > 0 && (
                <FigureRow label={t('catchUp')} value={money(figures.catchUp)} />
              )}
              <FigureRow label={t('bookValue')} value={money(figures.bookValue)} />
              <FigureRow label={t('received')} value={money(figures.received)} />
              <FigureRow
                label={resultLabel}
                value={money(Math.abs(gainLoss))}
                strong
                tone={resultTone}
              />
            </>
          ) : (
            <Group justify="center" py={4}>
              {model.figuresLoading ? (
                <Loader size="xs" />
              ) : (
                <Text size="xs" c="dimmed">
                  —
                </Text>
              )}
            </Group>
          )}
        </Stack>
      </Box>

      {rejection?.note && (
        <Box className={classes.rejection}>
          <Text className={classes.sectionTitle} c="red.8">
            {t('rejectReason')}
          </Text>
          <Text size="sm">{rejection.note}</Text>
        </Box>
      )}

      <SimpleGrid cols={2} spacing="md" className={classes.signatures}>
        {model.signatures.map((signature, index) => (
          <SignatureBlock key={`${signature.title}-${index}`} signature={signature} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default WriteOffSheet;
