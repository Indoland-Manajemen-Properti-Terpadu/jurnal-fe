import { Accordion, Button, Stack, Text } from '@mantine/core';
import {
  IconAdjustmentsHorizontal,
  IconBulb,
  IconCalendarStats,
  IconTrendingDown,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import { canReviseAsset } from '@/module/assets/domain/assetRules';
import { estimateDepreciation, isNonDepreciable } from '@/module/assets/domain/depreciation';
import { AssetFact, AssetFactGrid } from '@/module/assets/presentation/components/AssetFacts';
import { AssetScheduleTable } from '@/module/assets/presentation/components/AssetScheduleTable';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { useDecimalPrecision } from '@/module/settings';

const METHOD_KEY = {
  straight_line: 'methodStraightLine',
  double_declining: 'methodDoubleDeclining',
  none: 'methodNone',
} as const;

const SHORT_METHOD_KEY = {
  straight_line: 'methodShortStraightLine',
  double_declining: 'methodShortDeclining',
  none: 'noDepreciation',
} as const;

export type AssetDepreciationPanelProps = {
  asset: AssetItem;
  /** Opens the dialog that changes the accounts and depreciation. */
  onRevise: () => void;
};

/** Plain-language example of how this asset's yearly depreciation comes about. */
function DepreciationExplainer({ asset }: Readonly<{ asset: AssetItem }>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');
  const money = (value: number) => formatAssetMoney(value, precision);
  const estimate = estimateDepreciation(
    asset.acquisitionCost,
    asset.residualValue,
    asset.usefulLifeYears,
    asset.depreciationMethod
  );
  const example =
    asset.depreciationMethod === 'straight_line'
      ? t('explainStraight', {
          cost: money(asset.acquisitionCost),
          residual: money(asset.residualValue),
          years: asset.usefulLifeYears,
          annual: money(estimate.annual),
        })
      : t('explainDeclining', { rate: Math.round((2 / asset.usefulLifeYears) * 100) });

  return (
    <Accordion variant="contained" radius="md" chevronPosition="right">
      <Accordion.Item value="explain">
        <Accordion.Control icon={<IconBulb size={18} color="var(--mantine-color-primary-6)" />}>
          <Text fz="sm" fw={600}>
            {t('explainTitle')}
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xs">
            <Text fz="sm" c="dark.7">
              {t('explainBody')}
            </Text>
            <Text fz="sm" c="dark.7">
              {example}
            </Text>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

/** "Penyusutan" tab, two cards: the terms the asset is depreciated by, then the yearly schedule. */
export function AssetDepreciationPanel({ asset, onRevise }: Readonly<AssetDepreciationPanelProps>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');
  const pending = asset.status === 'pending';
  const depreciated = !pending && !isNonDepreciable(asset);

  return (
    <Stack gap="lg">
      <AssetCard
        icon={IconAdjustmentsHorizontal}
        title={t('financialSummary')}
        subtitle={t('termsSub')}
        right={
          canReviseAsset(asset) ? (
            <Button
              variant="default"
              size="xs"
              radius="md"
              leftSection={<IconTrendingDown size={15} />}
              onClick={onRevise}
            >
              {t('reviseShort')}
            </Button>
          ) : undefined
        }
      >
        {pending ? (
          <Text fz="sm" c="dimmed">
            {t('schedulePendingSub')}
          </Text>
        ) : (
          <AssetFactGrid>
            <AssetFact
              label={t('depreciationMethod')}
              value={t(METHOD_KEY[asset.depreciationMethod])}
            />
            <AssetFact
              label={t('usefulLife')}
              value={
                depreciated
                  ? t('yearsValue', { years: asset.usefulLifeYears })
                  : t('noDepreciation')
              }
            />
            <AssetFact
              label={t('residualPlain')}
              value={formatAssetMoney(asset.residualValue, precision)}
              numeric
            />
            <AssetFact
              label={t('startDateLabel')}
              value={formatAssetDate(asset.depreciationStartDate ?? asset.acquisitionDate)}
            />
            <AssetFact
              label={t('monthlyEstimateLabel')}
              value={depreciated ? formatAssetMoney(asset.monthlyEstimate, precision) : undefined}
              numeric
            />
            {asset.openingAccumulatedDepreciation > 0 && (
              <AssetFact
                label={t('openingAccumLabel')}
                value={formatAssetMoney(asset.openingAccumulatedDepreciation, precision)}
                numeric
              />
            )}
          </AssetFactGrid>
        )}
      </AssetCard>

      <AssetCard
        icon={IconCalendarStats}
        title={t('annualScheduleTitle')}
        subtitle={
          pending
            ? t('schedulePendingNotice')
            : depreciated
              ? t('scheduleBasis', { years: asset.usefulLifeYears })
              : t('scheduleEmptyDesc')
        }
        right={
          depreciated ? (
            <Text size="xs" c="dimmed" fw={600} style={{ whiteSpace: 'nowrap' }}>
              {t(SHORT_METHOD_KEY[asset.depreciationMethod])}
            </Text>
          ) : undefined
        }
      >
        <Stack gap="md">
          <AssetScheduleTable asset={asset} />
          {depreciated && <DepreciationExplainer asset={asset} />}
        </Stack>
      </AssetCard>
    </Stack>
  );
}

export default AssetDepreciationPanel;
