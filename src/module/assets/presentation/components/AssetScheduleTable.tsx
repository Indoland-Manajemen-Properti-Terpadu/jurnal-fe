import { Badge, Group, Paper, Table, Text } from '@mantine/core';
import { IconCalendarStats } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { fromMinor, toMinor } from '@/lib/money/money';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import { isNonDepreciable } from '@/module/assets/domain/depreciation';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/AssetDetail.module.css';
import { useDecimalPrecision } from '@/module/settings';

const HEADER_PROPS = { size: 'xs', fw: 700, c: 'dimmed', tt: 'uppercase' } as const;

/**
 * Yearly schedule exactly as the API calculated it, in a bordered frame; the first and last year
 * can be partial and the current year is marked. Without a schedule it explains why.
 */
export function AssetScheduleTable({ asset }: Readonly<{ asset: AssetItem }>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');
  const pending = asset.status === 'pending';
  const noSchedule = pending || isNonDepreciable(asset) || asset.schedule.length === 0;
  const currentYear = new Date().getFullYear();
  const totalExpense = Number(
    fromMinor(asset.schedule.reduce((sum, row) => sum + toMinor(row.expense), 0))
  );

  if (noSchedule) {
    return (
      <EmptyState
        title={pending ? t('scheduleEmptyPendingTitle') : t('scheduleEmptyTitle')}
        description={pending ? t('schedulePendingNotice') : t('scheduleEmptyDesc')}
        icon={<IconCalendarStats size={36} stroke={1.5} />}
        py={32}
      />
    );
  }

  return (
    <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={440}>
        <Table verticalSpacing="sm" horizontalSpacing="md" fz="sm">
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
            {asset.schedule.map((row) => {
              const current = row.year === currentYear;
              return (
                <Table.Tr key={row.year} className={current ? classes.currentYear : undefined}>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <Text size="sm" fw={600}>
                        {row.year}
                      </Text>
                      {current && (
                        <Badge size="xs" variant="light" color="primary" radius="sm" tt="none">
                          {t('thisYear')}
                        </Badge>
                      )}
                    </Group>
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
                  <Table.Td className={classes.number} fw={700} c="dark.9">
                    {formatAssetMoney(row.ending, precision)}
                  </Table.Td>
                </Table.Tr>
              );
            })}
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
    </Paper>
  );
}

export default AssetScheduleTable;
