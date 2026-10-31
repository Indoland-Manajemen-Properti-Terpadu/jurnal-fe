import React from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconCalendarStats, IconMapPin, IconTimeline } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { AssetItem } from '@/module/assets/domain/asset';
import {
  depreciationPercent,
  generateDepreciationSchedule,
  isNonDepreciable,
  remainingPercentOfCost,
  toSafeNumber,
} from '@/module/assets/domain/depreciation';
import { useTranslation } from '@/i18n';

export type AssetScheduleModalProps = {
  opened: boolean;
  onClose: () => void;
  asset: AssetItem | null;
};

export const AssetScheduleModal: React.FC<AssetScheduleModalProps> = ({
  opened,
  onClose,
  asset,
}) => {
  const { t } = useTranslation('assets');

  if (!asset) return null;

  const nonDepreciable = isNonDepreciable(asset);
  const schedule = generateDepreciationSchedule(asset);

  const cost = toSafeNumber(asset.acquisitionCost);
  const residual = toSafeNumber(asset.residualValue);
  const accum = toSafeNumber(asset.accumulatedDepreciation);
  const nbv = toSafeNumber(asset.netBookValue);
  const depPercent = depreciationPercent(cost, accum);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon
            size={38}
            radius="md"
            variant="gradient"
            gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
          >
            <IconCalendarStats size={20} stroke={1.8} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md" c="dark.9" lh={1.2}>
              {t('scheduleModalTitle')}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {asset.name} •{' '}
              <Text span ff="monospace" fw={600}>
                {asset.code}
              </Text>
            </Text>
          </Box>
        </Group>
      }
      size="xl"
      radius="lg"
      centered
      padding="lg"
    >
      <Stack gap="lg">
        {/* Top 4 KPI Summary Cards */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              {t('acquisitionCost')}
            </Text>
            <Text
              size="sm"
              fw={800}
              c="dark.8"
              mt={4}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatCurrency(cost)}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {t('acquisitionCostHint')}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              {t('residualValueShort')}
            </Text>
            <Text
              size="sm"
              fw={800}
              c="dark.8"
              mt={4}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatCurrency(residual)}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {t('residualValueHint')}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              {t('usefulLife')}
            </Text>
            <Text size="sm" fw={800} c="primary.8" mt={4}>
              {nonDepreciable
                ? t('noDepreciation')
                : t('yearsValue', { years: asset.usefulLifeYears })}
            </Text>
            <Badge size="xs" variant="light" color={nonDepreciable ? 'gray' : 'primary'} mt={2}>
              {asset.depreciationMethod === 'straight_line'
                ? t('methodShortStraightLine')
                : asset.depreciationMethod === 'double_declining'
                  ? t('methodShortDeclining')
                  : t('methodShortNone')}
            </Badge>
          </Paper>

          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              {t('netBookValue')}
            </Text>
            <Text
              size="sm"
              fw={800}
              c="teal.8"
              mt={4}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatCurrency(nbv)}
            </Text>
            <Text size="xs" c="teal.7" fw={600} mt={2}>
              {nonDepreciable
                ? t('fullyIntact')
                : t('remainingValue', { percent: 100 - depPercent })}
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Informative Guidance Banner for Non-Depreciable Assets (like Tanah) */}
        {nonDepreciable ? (
          <Paper
            withBorder
            radius="md"
            p="md"
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-green-0) 0%, var(--mantine-color-teal-0) 100%)',
              borderColor: 'var(--mantine-color-green-3)',
            }}
          >
            <Group align="flex-start" gap="md" wrap="nowrap">
              <ThemeIcon
                size={44}
                radius="md"
                variant="light"
                color="green"
                style={{ flexShrink: 0 }}
              >
                <IconMapPin size={24} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={700} c="green.9">
                  {t('psakTitle')}
                </Text>
                <Text size="xs" c="green.9" mt={4} lh={1.6}>
                  {t('psakBodyPrefix')} <b>{t('psakLandWord')}</b> {t('psakBodySuffix')}
                </Text>
                <Text size="xs" c="dimmed" mt={6}>
                  {t('psakNoteBefore')} <b>{formatCurrency(cost)}</b> {t('psakNoteAfter')}
                </Text>
              </Box>
            </Group>
          </Paper>
        ) : (
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon size={24} radius="sm" variant="light" color="primary">
                  <IconTimeline size={14} />
                </ThemeIcon>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts={0.5}>
                  {t('scheduleTableTitle')}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {t('schedulePeriodsTotal', { count: schedule.length })}
              </Text>
            </Group>

            {/* Modern Detailed Schedule Table */}
            <Box
              style={{
                border: '1px solid var(--mantine-color-gray-2)',
                borderRadius: 'var(--mantine-radius-md)',
                overflow: 'hidden',
                backgroundColor: 'white',
              }}
            >
              <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover striped={false}>
                <Table.Thead bg="gray.1">
                  <Table.Tr>
                    <Table.Th style={{ width: '25%' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        {t('colPeriodYear')}
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ width: '20%', textAlign: 'right' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        {t('beginningBookValue')}
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ width: '20%', textAlign: 'right' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        {t('colExpenseThisYear')}
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ width: '18%', textAlign: 'right' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        {t('accumulatedDepreciation')}
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ width: '17%', textAlign: 'right' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        {t('endingBookValue')}
                      </Text>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {schedule.map((row) => {
                    const yearEnding = row.endingBookValue;
                    const percentRemain = remainingPercentOfCost(cost, yearEnding);

                    return (
                      <Table.Tr key={`schedule-yr-${row.yearNumber}`}>
                        {/* Periode / Tahun - Wide and Non-Truncated */}
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap" align="center">
                            <Badge
                              size="sm"
                              variant="light"
                              color="primary"
                              radius="sm"
                              styles={{ label: { textTransform: 'none', fontWeight: 600 } }}
                            >
                              {t('yearOrdinal', { number: row.yearNumber })}
                            </Badge>
                            <Text size="xs" fw={600} c="dark.7">
                              {t('yearLabel', { year: row.yearDate })}
                            </Text>
                          </Group>
                        </Table.Td>

                        {/* Nilai Buku Awal */}
                        <Table.Td
                          style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                        >
                          <Text size="xs" fw={500} c="dark.7">
                            {formatCurrency(row.beginningBookValue)}
                          </Text>
                        </Table.Td>

                        {/* Beban Penyusutan Tahun Ini */}
                        <Table.Td
                          style={{
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          <Text size="xs" fw={700} c="orange.8">
                            -{formatCurrency(row.depreciationExpense)}
                          </Text>
                        </Table.Td>

                        {/* Akumulasi Susut */}
                        <Table.Td
                          style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                        >
                          <Text size="xs" c="dimmed">
                            {formatCurrency(row.accumulatedDepreciation)}
                          </Text>
                        </Table.Td>

                        {/* Nilai Buku Akhir */}
                        <Table.Td
                          style={{
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          <Text size="xs" fw={800} c="teal.8">
                            {formatCurrency(row.endingBookValue)}
                          </Text>
                          <Text size="10px" c="dimmed">
                            {t('remainingShort', { percent: percentRemain })}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} size="sm" radius="md">
            {t('close')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AssetScheduleModal;
