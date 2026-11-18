import { useState } from 'react';
import { Alert, Badge, Box, Button, Group, List, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconCalendarDue, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import type { DepreciationRunResult } from '@/module/assets/domain/writeOff';
import { formatAssetMonth } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import classes from '@/module/assets/presentation/components/WorkList.module.css';
import { WorkRow } from '@/module/assets/presentation/components/WorkRow';
import { useAssetAccountCheck } from '@/module/assets/presentation/hooks/useAssetAccountCheck';
import { useRunDepreciation } from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { useDecimalPrecision } from '@/module/settings';
import { routes } from '@/router/routes';

export type NeedsYouDepreciationProps = {
  id: string;
  assets: AssetItem[];
  /** `YYYY-MM` the run books up to: the last month that has ended. */
  upTo: string;
};

function RunResult({ result }: Readonly<{ result: DepreciationRunResult }>) {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  // A failed or skipped asset is not in the journal, whatever the plan listed for it.
  const notBooked = new Set([...result.failed, ...result.skipped].map((line) => line.code));
  const booked = result.plan.filter((row) => !notBooked.has(row.code));
  const bookedAmount = booked.reduce((sum, row) => sum + row.amount, 0);
  const problems = [
    ...result.failed.map((line) => ({ ...line, kind: t('runFailed') })),
    ...result.skipped.map((line) => ({ ...line, kind: t('runSkipped') })),
  ];
  return (
    <Stack gap="xs" mb="md">
      {booked.length > 0 && (
        <Alert
          color="green"
          variant="light"
          radius="md"
          icon={<IconCircleCheck size={18} />}
          title={t('runDoneTitle')}
        >
          {t('runDone', {
            amount: formatAssetMoney(bookedAmount, precision),
            count: booked.length,
          })}
        </Alert>
      )}
      {problems.length > 0 && (
        <Alert
          color="yellow"
          variant="light"
          radius="md"
          icon={<IconAlertTriangle size={18} />}
          title={t('runProblems')}
        >
          <List size="sm" spacing={4}>
            {problems.map((line, index) => (
              <List.Item key={`${line.code}-${index}`}>
                <Text span fw={600} size="sm">
                  {line.code ? `${line.code} · ` : ''}
                  {line.kind}:
                </Text>{' '}
                <Text span size="sm">
                  {line.reason}
                </Text>
              </List.Item>
            ))}
          </List>
        </Alert>
      )}
    </Stack>
  );
}

/** Assets whose monthly depreciation fell behind, and one action that books them up to last month. */
export function NeedsYouDepreciation({ id, assets, upTo }: Readonly<NeedsYouDepreciationProps>) {
  const { t, i18n } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const run = useRunDepreciation();
  const accountCheck = useAssetAccountCheck();
  const invalidIds = new Set(
    assets.filter((asset) => accountCheck.invalidFor(asset).length > 0).map((asset) => asset.id)
  );
  const blocked = invalidIds.size > 0;
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<DepreciationRunResult | null>(null);
  const month = formatAssetMonth(upTo, i18n.language);
  const total = assets.reduce((sum, asset) => sum + asset.depreciationDue.amount, 0);

  const book = async () => {
    try {
      setResult(await run.mutateAsync({ upTo }));
    } catch {
      // The mutation already shows why; nothing was booked.
    } finally {
      setConfirming(false);
    }
  };

  if (assets.length === 0 && !result) return null;

  return (
    <Box id={id}>
      <AssetCard
        icon={IconCalendarDue}
        title={t('groupDepreciation')}
        subtitle={t('groupDepreciationSub')}
        right={
          <Group gap="sm" wrap="nowrap">
            <Badge variant="light" color="gray" radius="sm">
              {assets.length}
            </Badge>
            {assets.length > 0 && (
              <Tooltip label={t('bookBlocked')} disabled={!blocked} multiline w={260} withArrow>
                <Button radius="md" disabled={blocked} onClick={() => setConfirming(true)}>
                  {t('bookUpTo', { month })}
                </Button>
              </Tooltip>
            )}
          </Group>
        }
      >
        {result && <RunResult result={result} />}
        <div className={classes.list}>
          {assets.map((asset) => (
            <WorkRow
              key={asset.id}
              icon={IconCalendarDue}
              title={asset.code}
              titleSuffix={asset.name}
              subtitle={
                invalidIds.has(asset.id)
                  ? `${t('monthsDue', { months: asset.depreciationDue.months })} · ${t('accountsInvalidRow')}`
                  : t('monthsDue', { months: asset.depreciationDue.months })
              }
              side={
                <Text size="sm" fw={500} className={classes.amount}>
                  {formatAssetMoney(asset.depreciationDue.amount, precision)}
                </Text>
              }
              to={routes.assets.detail.replace(':id', asset.id)}
            />
          ))}
        </div>
      </AssetCard>

      <Modal
        opened={confirming}
        onClose={() => setConfirming(false)}
        centered
        radius="lg"
        title={t('runTitle')}
      >
        <Stack gap="md">
          <Text size="sm">
            {t('runBody', {
              count: assets.length,
              amount: formatAssetMoney(total, precision),
              month,
            })}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              radius="md"
              onClick={() => setConfirming(false)}
              disabled={run.isPending}
            >
              {t('cancel')}
            </Button>
            <Button radius="md" loading={run.isPending} onClick={book}>
              {t('runConfirm')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default NeedsYouDepreciation;
