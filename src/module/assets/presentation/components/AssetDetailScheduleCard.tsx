import { Table, Text } from '@mantine/core';
import { IconCalendarStats } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { fromMinor, toMinor } from '@/lib/money/money';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import { isNonDepreciable } from '@/module/assets/domain/depreciation';
import { AssetSectionCard } from '@/module/assets/presentation/components/AssetSectionCard';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/AssetDetail.module.css';
import { useDecimalPrecision } from '@/module/settings';

const METHOD_KEY = {
  straight_line: 'methodShortStraightLine',
  double_declining: 'methodShortDeclining',
  none: 'noDepreciation',
} as const;

const HEADER_PROPS = { size: 'xs', fw: 700, c: 'dimmed', tt: 'uppercase' } as const;

/** Yearly schedule exactly as the API calculated it; the first and last year can be partial. */
export function AssetDetailScheduleCard({ asset }: Readonly<{ asset: AssetItem }>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');
  const pending = asset.status === 'pending';
  const noSchedule = pending || isNonDepreciable(asset) || asset.schedule.length === 0;
  const currentYear = new Date().getFullYear();
  const totalExpense = Number(
    fromMinor(asset.schedule.reduce((sum, row) => sum + toMinor(row.expense), 0))
  );

  const subtitle = pending
    ? t('schedulePendingSub')
    : isNonDepreciable(asset)
      ? t('landNoDepreciation')
      : t('scheduleBasis', { years: asset.usefulLifeYears });

  return (
    <AssetSectionCard
      icon={IconCalendarStats}
      title={t('annualScheduleTitle')}
      subtitle={subtitle}
      right={
        !pending ? (
          <Text size="xs" c="dimmed" fw={600} style={{ whiteSpace: 'nowrap' }}>
            {t(METHOD_KEY[asset.depreciationMethod])}
          </Text>
        ) : undefined
      }
    >
      {noSchedule ? (
        <EmptyState
          title={pending ? t('scheduleEmptyPendingTitle') : t('scheduleEmptyTitle')}
          description={pending ? t('schedulePendingNotice') : t('scheduleEmptyDesc')}
          icon={<IconCalendarStats size={36} stroke={1.5} />}
          py={32}
        />
      ) : (
        <Table.ScrollContainer minWidth={440}>
          <Table verticalSpacing="sm" horizontalSpacing="sm" fz="sm">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>
                  <Text {...HEADER_PROPS}>{t('periodYear')}</Text>
                </Table.Th>
                {(['colExpense', 'colAccumulatedShort', 'colEndValue'] as const).map((key) => (
                  <Table.Th key={key} ta="right">
                    <Text {...HEADER_PROPS}>{t(key)}</Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {asset.schedule.map((row) => (
                <Table.Tr
                  key={row.year}
                  className={row.year === currentYear ? classes.currentYear : undefined}
                >
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {row.year}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('monthsShort', { count: row.months })}
                    </Text>
                  </Table.Td>
                  <Table.Td className={classes.number} fw={600}>
                    {formatAssetMoney(row.expense, precision)}
                  </Table.Td>
                  <Table.Td className={classes.number}>
                    {formatAssetMoney(row.accumulated, precision)}
                  </Table.Td>
                  <Table.Td className={classes.number} fw={700} c="teal.8">
                    {formatAssetMoney(row.ending, precision)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr bg="gray.0">
                <Table.Td>
                  <Text size="sm" fw={700}>
                    {t('scheduleTotal')}
                  </Text>
                </Table.Td>
                <Table.Td className={classes.number} fw={700}>
                  {formatAssetMoney(totalExpense, precision)}
                </Table.Td>
                <Table.Td />
                <Table.Td />
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>
      )}
    </AssetSectionCard>
  );
}

export default AssetDetailScheduleCard;
