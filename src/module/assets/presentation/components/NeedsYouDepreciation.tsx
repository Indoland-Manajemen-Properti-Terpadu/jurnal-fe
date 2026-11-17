import { useState } from 'react';
import { Alert, Box, Button, Group, List, Modal, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconCalendarDue, IconCircleCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import type { DepreciationRunResult } from '@/module/assets/domain/writeOff';
import { formatAssetMonth } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/NeedsYou.module.css';
import { NeedsYouSection } from '@/module/assets/presentation/components/NeedsYouSection';
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
  const problems = [
    ...result.failed.map((line) => ({ ...line, kind: t('runFailed') })),
    ...result.skipped.map((line) => ({ ...line, kind: t('runSkipped') })),
  ];
  return (
    <Stack gap="xs" mb="md">
      {result.amount > 0 && (
        <Alert
          color="teal"
          variant="light"
          radius="md"
          icon={<IconCircleCheck size={18} />}
          title={t('runDoneTitle')}
        >
          {t('runDone', {
            amount: formatAssetMoney(result.amount, precision),
            count: result.plan.length,
          })}
        </Alert>
      )}
      {problems.length > 0 && (
        <Alert
          color="orange"
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
    <NeedsYouSection
      id={id}
      icon={IconCalendarDue}
      color="secondary"
      title={t('groupDepreciation')}
      subtitle={t('groupDepreciationSub')}
      count={assets.length}
      action={
        assets.length > 0 && (
          <Button radius="md" onClick={() => setConfirming(true)}>
            {t('bookUpTo', { month })}
          </Button>
        )
      }
    >
      {result && <RunResult result={result} />}
      <Stack gap="xs">
        {assets.map((asset) => (
          <Box key={asset.id} className={classes.row}>
            <Box className={classes.rowMain}>
              <Text
                component={Link}
                to={routes.assets.detail.replace(':id', asset.id)}
                fw={700}
                size="sm"
                c="primary.8"
              >
                {asset.name}
              </Text>
              <Text size="xs" c="dimmed">
                {asset.code} · {t('monthsDue', { months: asset.depreciationDue.months })}
              </Text>
            </Box>
            <Text size="sm" fw={600} className={classes.num}>
              {formatAssetMoney(asset.depreciationDue.amount, precision)}
            </Text>
          </Box>
        ))}
      </Stack>

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
    </NeedsYouSection>
  );
}

export default NeedsYouDepreciation;
