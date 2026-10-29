import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  CopyButton,
  Divider,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBuilding,
  IconBuildingWarehouse,
  IconCalendar,
  IconCalendarStats,
  IconCar,
  IconCheck,
  IconCoins,
  IconCopy,
  IconDeviceLaptop,
  IconEdit,
  IconFileText,
  IconInfoCircle,
  IconMapPin,
  IconScale,
  IconTool,
  IconTrash,
  IconTrendingDown,
  IconX,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/FormatCurrency';
import AssetLayout from '@/module/assets/presentation/pages/Layout';
import AssetFormModal from '@/module/assets/presentation/components/AssetFormModal';
import AssetDisposalModal from '@/module/assets/presentation/components/AssetDisposalModal';
import { useAssets } from '@/module/assets/presentation/hooks/useAssets';
import { AssetCategory, AssetItem } from '@/module/assets/domain/asset';
import { generateDepreciationSchedule } from '@/module/assets/domain/depreciation';

const getCategoryMeta = (cat: AssetCategory) => {
  switch (cat) {
    case 'vehicle':
      return { label: 'Kendaraan', icon: IconCar, color: 'blue' };
    case 'building':
      return { label: 'Bangunan', icon: IconBuilding, color: 'indigo' };
    case 'machinery':
      return { label: 'Mesin & Peralatan', icon: IconTool, color: 'cyan' };
    case 'electronic':
      return { label: 'Elektronik & TI', icon: IconDeviceLaptop, color: 'violet' };
    case 'land':
      return { label: 'Tanah', icon: IconMapPin, color: 'teal' };
    default:
      return { label: 'Lainnya', icon: IconCoins, color: 'gray' };
  }
};

const formatDateIndo = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, isLoading, deleteAsset, saveAsset, disposeAsset } = useAssets();

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [disposalModalOpen, setDisposalModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Find asset
  const asset: AssetItem | undefined = useMemo(() => {
    return assets.find((a) => a.id === id);
  }, [assets, id]);

  const schedule = useMemo(() => {
    return asset ? generateDepreciationSchedule(asset) : [];
  }, [asset]);

  if (isLoading) {
    return (
      <AssetLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={56} radius="lg" />
            <Skeleton height={140} radius="lg" />
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Skeleton height={420} radius="lg" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Skeleton height={420} radius="lg" />
              </Grid.Col>
            </Grid>
          </Stack>
        </Box>
      </AssetLayout>
    );
  }

  if (!asset) {
    return (
      <AssetLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder p="xl" radius="lg" ta="center" bg="white">
            <ThemeIcon size={60} radius="xl" color="red" variant="light" mx="auto" mb="md">
              <IconX size={28} />
            </ThemeIcon>
            <Title order={3} c="dark.8">
              Aset Tidak Ditemukan
            </Title>
            <Text c="dimmed" size="sm" mt="xs" mb="lg">
              Data aset mungkin telah dihapus atau ID aset tidak valid di sistem pembukuan.
            </Text>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(routes.baseModules.assets)}
            >
              Kembali ke Daftar Aset
            </Button>
          </Paper>
        </Box>
      </AssetLayout>
    );
  }

  const categoryMeta = getCategoryMeta(asset.category);
  const CategoryIcon = categoryMeta.icon;

  const cost = Number(asset.acquisitionCost) || 0;
  const residual = Number(asset.residualValue) || 0;
  const accum = Number(asset.accumulatedDepreciation) || 0;
  const nbv = Number(asset.netBookValue) || 0;
  const isNonDepreciable = asset.depreciationMethod === 'none' || asset.usefulLifeYears <= 0;
  const depPercent = cost > 0 ? Math.min(100, Math.round((accum / cost) * 100)) : 0;
  const remainingPercent = 100 - depPercent;

  const handleDelete = () => {
    deleteAsset(asset.id, asset.name);
    setDeleteConfirmOpen(false);
    navigate(routes.baseModules.assets);
  };

  return (
    <AssetLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Top Bar Navigation & Actions (Consistent with SaleDetailPage) */}
          <Paper withBorder radius="lg" p={{ base: 'sm', sm: 'md' }} bg="white">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.baseModules.assets)}
              >
                Kembali ke Daftar Aset
              </Button>

              <Group gap="xs">
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setEditModalOpen(true)}
                >
                  Ubah Data
                </Button>

                {asset.status !== 'disposed' && (
                  <Button
                    variant="outline"
                    color="orange"
                    size="sm"
                    leftSection={<IconScale size={16} />}
                    onClick={() => setDisposalModalOpen(true)}
                  >
                    Pelepasan / Jual
                  </Button>
                )}

                <Button
                  variant="subtle"
                  color="red"
                  size="sm"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  Hapus
                </Button>
              </Group>
            </Group>
          </Paper>

          {/* Asset Hero Banner (Clean, Elegant, Standardized with other modules) */}
          <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
            <Grid gutter="lg" align="center">
              <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
                <Group gap="md" align="flex-start" wrap="nowrap">
                  <ThemeIcon
                    size={56}
                    radius="md"
                    variant="light"
                    color={categoryMeta.color}
                    style={{ flexShrink: 0 }}
                  >
                    <CategoryIcon size={28} />
                  </ThemeIcon>

                  <Box style={{ minWidth: 0 }}>
                    <Group gap="xs" align="center" mb={6} wrap="wrap">
                      <Title order={2} fz={{ base: 18, sm: 22 }} c="dark.9" fw={700}>
                        {asset.name}
                      </Title>

                      <CopyButton value={asset.code}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Tersalin' : 'Salin Kode Aset'}>
                            <ActionIcon
                              variant="subtle"
                              color={copied ? 'teal' : 'gray'}
                              size="sm"
                              onClick={copy}
                            >
                              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>

                      <Badge
                        size="sm"
                        variant="light"
                        color={
                          asset.status === 'active'
                            ? 'teal'
                            : asset.status === 'fully_depreciated'
                              ? 'gray'
                              : 'orange'
                        }
                      >
                        {asset.status === 'active'
                          ? 'Aktif'
                          : asset.status === 'fully_depreciated'
                            ? 'Habis Susut'
                            : 'Dilepas / Dijual'}
                      </Badge>
                    </Group>

                    <Group gap="md" wrap="wrap">
                      <Group gap={6} c="dimmed">
                        <IconCalendar size={14} />
                        <Text size="xs">
                          Perolehan:{' '}
                          <Text span fw={600} c="dark.7">
                            {formatDateIndo(asset.acquisitionDate)}
                          </Text>
                        </Text>
                      </Group>

                      <Text size="xs" c="gray.4">
                        •
                      </Text>

                      <Text size="xs" c="dimmed">
                        Kategori:{' '}
                        <Text span fw={600} c="dark.7">
                          {categoryMeta.label}
                        </Text>
                      </Text>

                      <Text size="xs" c="gray.4">
                        •
                      </Text>

                      <Text size="xs" c="dimmed">
                        Kode:{' '}
                        <Text span ff="monospace" fw={600} c="dark.7">
                          {asset.code}
                        </Text>
                      </Text>
                    </Group>
                  </Box>
                </Group>
              </Grid.Col>

              {/* Right Side: Primary Net Book Value Callout */}
              <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
                <Paper
                  withBorder
                  radius="md"
                  p="md"
                  style={{
                    backgroundColor: 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                    Nilai Buku Bersih (NBV)
                  </Text>
                  <Text
                    fz={24}
                    fw={800}
                    c="teal.8"
                    mt={2}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCurrency(nbv)}
                  </Text>
                  <Progress
                    value={isNonDepreciable ? 100 : remainingPercent}
                    size="sm"
                    radius="xl"
                    color="teal.6"
                    mt="xs"
                  />
                  <Group justify="space-between" mt={6}>
                    <Text size="xs" c="dimmed">
                      {isNonDepreciable ? 'Bebas Susut (100% Utuh)' : `Tersusut: ${depPercent}%`}
                    </Text>
                    <Text size="xs" fw={600} c="teal.7">
                      {isNonDepreciable ? '100% Sisa' : `${remainingPercent}% Sisa`}
                    </Text>
                  </Group>
                </Paper>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Disposal Alert (If asset was disposed) */}
          {asset.status === 'disposed' && (
            <Paper
              withBorder
              radius="lg"
              p="md"
              style={{
                backgroundColor: 'rgba(254, 243, 199, 0.4)',
                borderColor: 'var(--mantine-color-orange-3)',
              }}
            >
              <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Group gap="sm">
                  <ThemeIcon size={32} radius="md" color="orange" variant="light">
                    <IconScale size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} size="sm" c="dark.9">
                      Aset Telah Dilepas / Dijual
                    </Text>
                    <Text size="xs" c="dark.6">
                      Dilepas pada {formatDateIndo(asset.disposalDate)} dengan nilai jual{' '}
                      {formatCurrency(asset.disposalPrice ?? 0)}.
                    </Text>
                  </Box>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    Laba / (Rugi) Pelepasan:
                  </Text>
                  <Text
                    size="sm"
                    fw={700}
                    c={(asset.disposalGainLoss ?? 0) >= 0 ? 'teal.7' : 'red.7'}
                  >
                    {(asset.disposalGainLoss ?? 0) >= 0 ? '+' : ''}
                    {formatCurrency(asset.disposalGainLoss ?? 0)}
                  </Text>
                </Group>
              </Group>
            </Paper>
          )}

          {/* Main 2-Column Content Layout: Left Table & Right Info */}
          <Grid gutter="lg">
            {/* Left Column: Jadwal & Alokasi Penyusutan Tahunan */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper withBorder radius="lg" p="md" bg="white" h="100%">
                <Group justify="space-between" align="center" mb="md" wrap="wrap">
                  <Box>
                    <Text fw={700} size="md" c="dark.9">
                      Jadwal Penyusutan Tahunan
                    </Text>
                    <Text size="xs" c="dimmed">
                      {isNonDepreciable
                        ? 'Aset kategori tanah tidak mengalami depresiasi'
                        : `Alokasi depresiasi berkala berdasarkan masa manfaat ${asset.usefulLifeYears} tahun`}
                    </Text>
                  </Box>
                  <Badge variant="light" color="primary" size="sm">
                    {asset.depreciationMethod === 'straight_line'
                      ? 'Garis Lurus'
                      : asset.depreciationMethod === 'double_declining'
                        ? 'Saldo Menurun'
                        : 'Bebas Susut'}
                  </Badge>
                </Group>

                <Box style={{ overflowX: 'auto' }}>
                  <Table striped highlightOnHover withTableBorder style={{ minWidth: 540 }}>
                    <Table.Thead bg="gray.0">
                      <Table.Tr>
                        <Table.Th style={{ width: 80, textAlign: 'center' }}>Tahun</Table.Th>
                        <Table.Th style={{ width: 90, textAlign: 'center' }}>Periode</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Nilai Awal</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Beban Susut</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Akumulasi</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Nilai Akhir</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {schedule.map((row) => (
                        <Table.Tr key={row.yearNumber}>
                          <Table.Td style={{ textAlign: 'center' }}>
                            <Badge size="xs" variant="light" color="gray">
                              Th {row.yearNumber}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
                            {row.yearDate}
                          </Table.Td>
                          <Table.Td
                            style={{
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              fontSize: 13,
                            }}
                          >
                            {formatCurrency(row.beginningBookValue)}
                          </Table.Td>
                          <Table.Td
                            style={{
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              fontSize: 13,
                              color:
                                row.depreciationExpense > 0
                                  ? 'var(--mantine-color-red-7)'
                                  : undefined,
                              fontWeight: row.depreciationExpense > 0 ? 600 : 400,
                            }}
                          >
                            {formatCurrency(row.depreciationExpense)}
                          </Table.Td>
                          <Table.Td
                            style={{
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              fontSize: 13,
                            }}
                          >
                            {formatCurrency(row.accumulatedDepreciation)}
                          </Table.Td>
                          <Table.Td
                            style={{
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 700,
                              fontSize: 13,
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
            </Grid.Col>

            {/* Right Column: Ringkasan Nilai & Spesifikasi */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                {/* Nilai Finansial Detail */}
                <Paper withBorder radius="lg" p="md" bg="white">
                  <Text fw={700} size="sm" c="dark.9" mb="sm">
                    Ringkasan Finansial
                  </Text>
                  <Stack gap="xs">
                    <Group
                      justify="space-between"
                      py={4}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      <Text size="xs" c="dimmed">
                        Nilai Perolehan
                      </Text>
                      <Text size="xs" fw={700} c="dark.9">
                        {formatCurrency(cost)}
                      </Text>
                    </Group>

                    <Group
                      justify="space-between"
                      py={4}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      <Text size="xs" c="dimmed">
                        Akumulasi Penyusutan
                      </Text>
                      <Text size="xs" fw={700} c="red.7">
                        -{formatCurrency(accum)}
                      </Text>
                    </Group>

                    <Group
                      justify="space-between"
                      py={4}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      <Text size="xs" c="dimmed">
                        Nilai Buku Bersih (NBV)
                      </Text>
                      <Text size="xs" fw={800} c="teal.8">
                        {formatCurrency(nbv)}
                      </Text>
                    </Group>

                    <Group
                      justify="space-between"
                      py={4}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                      <Text size="xs" c="dimmed">
                        Nilai Residu
                      </Text>
                      <Text size="xs" fw={600} c="dark.8">
                        {formatCurrency(residual)}
                      </Text>
                    </Group>

                    <Group justify="space-between" py={4}>
                      <Text size="xs" c="dimmed">
                        Masa Manfaat
                      </Text>
                      <Text size="xs" fw={600} c="dark.8">
                        {isNonDepreciable ? 'Bebas Susut' : `${asset.usefulLifeYears} Tahun`}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Spesifikasi & Catatan */}
                <Paper withBorder radius="lg" p="md" bg="white">
                  <Text fw={700} size="sm" c="dark.9" mb="sm">
                    Catatan Aset
                  </Text>
                  <Box
                    p="sm"
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <Text size="xs" c="dark.7" lh={1.6}>
                      {asset.notes || 'Tidak ada catatan atau keterangan khusus.'}
                    </Text>
                  </Box>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      {/* Edit Modal */}
      <AssetFormModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={saveAsset}
        assetToEdit={asset}
      />

      {/* Disposal Modal */}
      <AssetDisposalModal
        opened={disposalModalOpen}
        onClose={() => setDisposalModalOpen(false)}
        asset={asset}
        onConfirmDisposal={disposeAsset}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Aset Tetap"
        message={`Apakah Anda yakin ingin menghapus data aset "${asset.name}"?`}
        helperText="Data nilai perolehan dan riwayat penyusutan aset ini akan dihapus secara permanen dari sistem."
        confirmLabel="Hapus Aset"
        cancelLabel="Batal"
      />
    </AssetLayout>
  );
};

export default AssetDetailPage;
