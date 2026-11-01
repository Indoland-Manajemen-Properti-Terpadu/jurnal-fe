import { Badge, Box, Group, Paper, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { AssetItem, DepreciationScheduleItem } from '@/module/assets/domain/asset';
import { isNonDepreciable } from '@/module/assets/domain/depreciation';

export type AssetDetailScheduleCardProps = {
  asset: AssetItem;
  schedule: DepreciationScheduleItem[];
};

const NUMBER_CELL = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  fontSize: 'var(--jurnal-text-sm)',
} as const;

export function AssetDetailScheduleCard({
  asset,
  schedule,
}: Readonly<AssetDetailScheduleCardProps>) {
  const { t } = useTranslation('assets');
  const nonDepreciable = isNonDepreciable(asset);

  const methodLabel =
    asset.depreciationMethod === 'straight_line'
      ? t('methodShortStraightLine')
      : asset.depreciationMethod === 'double_declining'
        ? t('methodShortDeclining')
        : t('noDepreciation');

  return (
    <Paper withBorder radius="lg" p="md" bg="white" h="100%">
      <Group justify="space-between" align="center" mb="md" wrap="wrap">
        <Box>
          <Text fw={700} size="md" c="dark.9">
            {t('annualScheduleTitle')}
          </Text>
          <Text size="xs" c="dimmed">
            {nonDepreciable
              ? t('landNoDepreciation')
              : t('scheduleBasis', { years: asset.usefulLifeYears })}
          </Text>
        </Box>
        <Badge variant="light" color="primary" size="sm">
          {methodLabel}
        </Badge>
      </Group>

      <Box style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover withTableBorder style={{ minWidth: 540 }}>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: 80, textAlign: 'center' }}>{t('periodYear')}</Table.Th>
              <Table.Th style={{ width: 90, textAlign: 'center' }}>{t('periodLabel')}</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>{t('colStartValue')}</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>{t('colExpense')}</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>{t('colAccumulatedShort')}</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>{t('colEndValue')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {schedule.map((row) => (
              <Table.Tr key={row.yearNumber}>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Badge size="xs" variant="light" color="gray">
                    {t('yearShort', { number: row.yearNumber })}
                  </Badge>
                </Table.Td>
                <Table.Td
                  style={{
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 'var(--jurnal-text-sm)',
                  }}
                >
                  {row.yearDate}
                </Table.Td>
                <Table.Td style={NUMBER_CELL}>{formatCurrency(row.beginningBookValue)}</Table.Td>
                <Table.Td
                  style={{
                    ...NUMBER_CELL,
                    color: row.depreciationExpense > 0 ? 'var(--mantine-color-red-7)' : undefined,
                    fontWeight: row.depreciationExpense > 0 ? 600 : 400,
                  }}
                >
                  {formatCurrency(row.depreciationExpense)}
                </Table.Td>
                <Table.Td style={NUMBER_CELL}>
                  {formatCurrency(row.accumulatedDepreciation)}
                </Table.Td>
                <Table.Td
                  style={{
                    ...NUMBER_CELL,
                    fontWeight: 700,
                    color: 'var(--mantine-color-teal-8)',
                  }}
                >
                  {formatCurrency(row.endingBookValue)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  );
}

export default AssetDetailScheduleCard;
