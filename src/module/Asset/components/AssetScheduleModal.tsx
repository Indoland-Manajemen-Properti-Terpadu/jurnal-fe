import React from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Modal,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCalendarStats,
  IconCoins,
  IconInfoCircle,
  IconMapPin,
  IconScale,
  IconTimeline,
  IconTrendingDown,
} from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { AssetItem } from '../types/asset';
import { generateDepreciationSchedule } from '../services/assetStorage';
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

  const isNonDepreciable = asset.depreciationMethod === 'none' || asset.usefulLifeYears <= 0;
  const schedule = generateDepreciationSchedule(asset);

  const cost = Number(asset.acquisitionCost) || 0;
  const residual = Number(asset.residualValue) || 0;
  const accum = Number(asset.accumulatedDepreciation) || 0;
  const nbv = Number(asset.netBookValue) || 0;
  const depPercent = cost > 0 ? Math.min(100, Math.round((accum / cost) * 100)) : 0;

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
              Jadwal & Simulasi Penyusutan Aset
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
              Nilai Perolehan
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
              Biaya akuisisi awal
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              Nilai Residu (Sisa)
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
              Batas bawah penyusutan
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              Masa Manfaat
            </Text>
            <Text size="sm" fw={800} c="primary.8" mt={4}>
              {isNonDepreciable ? 'Bebas Susut' : `${asset.usefulLifeYears} Tahun`}
            </Text>
            <Badge size="xs" variant="light" color={isNonDepreciable ? 'gray' : 'primary'} mt={2}>
              {asset.depreciationMethod === 'straight_line'
                ? 'Garis Lurus'
                : asset.depreciationMethod === 'double_declining'
                  ? 'Saldo Menurun'
                  : 'Tanpa Penyusutan'}
            </Badge>
          </Paper>

          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
              Nilai Buku Bersih (NBV)
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
              {isNonDepreciable ? '100% Utuh' : `Sisa ${100 - depPercent}% nilai`}
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Informative Guidance Banner for Non-Depreciable Assets (like Tanah) */}
        {isNonDepreciable ? (
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
                  Aset Tetap Tidak Mengalami Penyusutan (PSAK 16)
                </Text>
                <Text size="xs" c="green.9" mt={4} lh={1.6}>
                  Berdasarkan Standar Akuntansi Keuangan, aktiva tetap berwujud kategori{' '}
                  <b>Tanah</b> memiliki masa manfaat ekonomis yang tidak terbatas dan nilai
                  ekonomisnya tidak berkurang seiring berjalannya waktu.
                </Text>
                <Text size="xs" c="dimmed" mt={6}>
                  Oleh karena itu, nilai buku di Neraca (Balance Sheet) akan selalu tercatat konstan
                  sebesar <b>{formatCurrency(cost)}</b> tanpa ada pengakuan Beban Penyusutan tahunan
                  maupun bulanan.
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
                  Tabel Rincian Jadwal Alokasi Penyusutan Tahunan
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                Total {schedule.length} periode masa manfaat
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
                        Periode / Tahun
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ width: '20%', textAlign: 'right' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        Nilai Buku Awal
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ width: '20%', textAlign: 'right' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        Beban Susut Tahun Ini
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ width: '18%', textAlign: 'right' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        Akumulasi Susut
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ width: '17%', textAlign: 'right' }}>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                        Nilai Buku Akhir
                      </Text>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {schedule.map((row) => {
                    const yearEnding = row.endingBookValue;
                    const percentRemain = cost > 0 ? Math.round((yearEnding / cost) * 100) : 0;

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
                              Tahun ke-{row.yearNumber}
                            </Badge>
                            <Text size="xs" fw={600} c="dark.7">
                              Tahun {row.yearDate}
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
                            Sisa {percentRemain}%
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
            Tutup
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AssetScheduleModal;
