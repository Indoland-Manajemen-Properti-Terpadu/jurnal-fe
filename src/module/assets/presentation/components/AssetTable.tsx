import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Pagination,
  Paper,
  Progress,
  Select,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconBuilding,
  IconCalendarStats,
  IconCar,
  IconCoins,
  IconDeviceLaptop,
  IconDots,
  IconEye,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconScale,
  IconSearch,
  IconTool,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { AssetCategory, AssetItem } from '@/module/assets/domain/asset';
import { useTranslation } from '@/i18n';
import EmptyState from '@/components/EmptyState/EmptyState';

export type AssetTableProps = {
  assets: AssetItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onAddNew: () => void;
  onEdit: (asset: AssetItem) => void;
  onViewSchedule: (asset: AssetItem) => void;
  onViewDetail?: (asset: AssetItem) => void;
  onDispose: (asset: AssetItem) => void;
  onDelete: (asset: AssetItem) => void;
};

const PAGE_SIZE = 10;

export const AssetTable: React.FC<AssetTableProps> = ({
  assets = [],
  loading = false,
  onRefresh,
  onAddNew,
  onEdit,
  onViewSchedule,
  onViewDetail,
  onDispose,
  onDelete,
}) => {
  const { t } = useTranslation('assets');

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('highestNBV');
  const [page, setPage] = useState<number>(1);

  // Category counts
  const categoryCounts = useMemo(() => {
    const all = assets.length;
    const vehicle = assets.filter((a) => a.category === 'vehicle').length;
    const building = assets.filter((a) => a.category === 'building').length;
    const machinery = assets.filter((a) => a.category === 'machinery').length;
    const electronic = assets.filter((a) => a.category === 'electronic').length;
    const land = assets.filter((a) => a.category === 'land').length;
    return { all, vehicle, building, machinery, electronic, land };
  }, [assets]);

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Filter by tab category
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((a) => {
        const name = (a.name || '').toLowerCase();
        const code = (a.code || '').toLowerCase();
        const notes = (a.notes || '').toLowerCase();
        return name.includes(q) || code.includes(q) || notes.includes(q);
      });
    }

    // Sorting
    result.sort((a, b) => {
      const nbvA = Number(a.netBookValue) || 0;
      const nbvB = Number(b.netBookValue) || 0;
      const costA = Number(a.acquisitionCost) || 0;
      const costB = Number(b.acquisitionCost) || 0;
      const nameA = a.name || '';
      const nameB = b.name || '';
      const codeA = a.code || '';
      const codeB = b.code || '';

      if (sortBy === 'highestNBV') return nbvB - nbvA;
      if (sortBy === 'lowestNBV') return nbvA - nbvB;
      if (sortBy === 'highestCost') return costB - costA;
      if (sortBy === 'nameAsc') return nameA.localeCompare(nameB);
      if (sortBy === 'codeAsc') return codeA.localeCompare(codeB, undefined, { numeric: true });
      return 0;
    });

    return result;
  }, [assets, categoryFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAssets.length / PAGE_SIZE) || 1;
  const paginatedAssets = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAssets.slice(start, start + PAGE_SIZE);
  }, [filteredAssets, page]);

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setSortBy('highestNBV');
    setPage(1);
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'vehicle':
        return <IconCar size={18} stroke={1.8} />;
      case 'building':
        return <IconBuilding size={18} stroke={1.8} />;
      case 'machinery':
        return <IconTool size={18} stroke={1.8} />;
      case 'electronic':
        return <IconDeviceLaptop size={18} stroke={1.8} />;
      case 'land':
        return <IconMapPin size={18} stroke={1.8} />;
      default:
        return <IconCoins size={18} stroke={1.8} />;
    }
  };

  const getCategoryColor = (category: AssetCategory) => {
    switch (category) {
      case 'vehicle':
        return 'blue';
      case 'building':
        return 'indigo';
      case 'machinery':
        return 'orange';
      case 'electronic':
        return 'cyan';
      case 'land':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Stack gap="md">
      {/* Category Pills & Filter Bar */}
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Tabs
          value={categoryFilter}
          onChange={(val) => {
            setCategoryFilter(val || 'all');
            setPage(1);
          }}
          variant="pills"
          radius="md"
          color="primary"
        >
          <Tabs.List>
            <Tabs.Tab
              value="all"
              rightSection={
                <Badge size="xs" variant="light" color="primary" circle={false}>
                  {categoryCounts.all}
                </Badge>
              }
            >
              {t('allCategories')}
            </Tabs.Tab>
            <Tabs.Tab
              value="vehicle"
              leftSection={<IconCar size={15} />}
              rightSection={
                <Badge size="xs" variant="light" color="blue" circle={false}>
                  {categoryCounts.vehicle}
                </Badge>
              }
            >
              {t('categoryVehicle')}
            </Tabs.Tab>
            <Tabs.Tab
              value="building"
              leftSection={<IconBuilding size={15} />}
              rightSection={
                <Badge size="xs" variant="light" color="indigo" circle={false}>
                  {categoryCounts.building}
                </Badge>
              }
            >
              {t('categoryBuilding')}
            </Tabs.Tab>
            <Tabs.Tab
              value="machinery"
              leftSection={<IconTool size={15} />}
              rightSection={
                <Badge size="xs" variant="light" color="orange" circle={false}>
                  {categoryCounts.machinery}
                </Badge>
              }
            >
              {t('categoryMachinery')}
            </Tabs.Tab>
            <Tabs.Tab
              value="electronic"
              leftSection={<IconDeviceLaptop size={15} />}
              rightSection={
                <Badge size="xs" variant="light" color="cyan" circle={false}>
                  {categoryCounts.electronic}
                </Badge>
              }
            >
              {t('categoryElectronic')}
            </Tabs.Tab>
            <Tabs.Tab
              value="land"
              leftSection={<IconMapPin size={15} />}
              rightSection={
                <Badge size="xs" variant="light" color="green" circle={false}>
                  {categoryCounts.land}
                </Badge>
              }
            >
              {t('categoryLand')}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Group gap="xs" style={{ flex: 1, minWidth: 280, justifyContent: 'flex-end' }}>
          <TextInput
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setPage(1);
            }}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => setSearchQuery('')}
                >
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
            radius="md"
            size="sm"
            style={{ flex: 1, maxWidth: 360 }}
          />

          <Select
            value={sortBy}
            onChange={(val) => setSortBy(val || 'highestNBV')}
            data={[
              { value: 'highestNBV', label: 'Nilai Buku Tertinggi' },
              { value: 'lowestNBV', label: 'Nilai Buku Terendah' },
              { value: 'highestCost', label: 'Nilai Perolehan Tertinggi' },
              { value: 'nameAsc', label: 'Nama Aset (A-Z)' },
              { value: 'codeAsc', label: 'Kode Aset (0-9)' },
            ]}
            radius="md"
            size="sm"
            w={200}
            comboboxProps={{ position: 'bottom-end', shadow: 'md' }}
          />

          {onRefresh && (
            <Tooltip label="Segarkan Data" withArrow>
              <ActionIcon
                variant="light"
                color="primary"
                size="input-sm"
                radius="md"
                onClick={onRefresh}
                loading={loading}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      {/* Main Table */}
      <Box
        style={{
          border: '1px solid var(--mantine-color-gray-2)',
          borderRadius: 'var(--mantine-radius-md)',
          overflow: 'hidden',
          backgroundColor: 'white',
        }}
      >
        <Table
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          striped={false}
          style={{ minWidth: 800 }}
        >
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: '32%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('name')} & {t('code')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '15%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('category')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '18%', textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('acquisitionCost')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('currentNBV')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '12%', textAlign: 'center' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('status')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '8%', textAlign: 'center' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {t('actions')}
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              // Loading Skeletons
              Array.from({ length: 5 }).map((_, idx) => (
                <Table.Tr key={`skel-asset-${idx}`}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Skeleton circle height={38} width={38} />
                      <Box style={{ flex: 1 }}>
                        <Skeleton height={14} width="70%" radius="sm" mb={6} />
                        <Skeleton height={10} width="40%" radius="sm" />
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} width={90} radius="sm" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={16} width="80%" radius="sm" ml="auto" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={16} width="70%" radius="sm" ml="auto" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={20} width={70} radius="sm" mx="auto" />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton circle height={28} width={28} mx="auto" />
                  </Table.Td>
                </Table.Tr>
              ))
            ) : paginatedAssets.length === 0 ? (
              // Empty State
              <Table.Tr>
                <Table.Td colSpan={6} p={0}>
                  {assets.length === 0 ? (
                    <EmptyState
                      title={t('noAssetsYet')}
                      description={t('noAssetsYetDesc')}
                      icon={<IconCoins size={36} stroke={1.5} />}
                      actionLabel={t('addAsset')}
                      actionIcon={<IconPlus size={14} />}
                      onAction={onAddNew}
                      py={48}
                    />
                  ) : (
                    <EmptyState
                      title={t('noAssetsFound')}
                      description={t('noAssetsFoundDesc')}
                      icon={<IconSearch size={36} stroke={1.5} />}
                      actionLabel={t('resetFilter')}
                      onAction={handleResetFilters}
                      py={48}
                    />
                  )}
                </Table.Td>
              </Table.Tr>
            ) : (
              // Data rows
              paginatedAssets.map((asset) => {
                const color = getCategoryColor(asset.category);
                const cost = Number(asset.acquisitionCost) || 0;
                const accum = Number(asset.accumulatedDepreciation) || 0;
                const nbv = Number(asset.netBookValue) || 0;
                const depRatio = cost > 0 ? Math.min(100, Math.round((accum / cost) * 100)) : 0;

                return (
                  <Table.Tr
                    key={asset.id}
                    onClick={() => (onViewDetail ? onViewDetail(asset) : onViewSchedule(asset))}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 150ms ease',
                    }}
                  >
                    {/* Name & Code */}
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <ThemeIcon
                          size={38}
                          radius="md"
                          variant="light"
                          color={color}
                          style={{ flexShrink: 0 }}
                        >
                          {getCategoryIcon(asset.category)}
                        </ThemeIcon>

                        <Box style={{ minWidth: 0 }}>
                          <Text
                            size="sm"
                            fw={600}
                            c="dark.8"
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {asset.name}
                          </Text>

                          <Group gap={6} mt={2} align="center">
                            <Badge
                              size="xs"
                              variant="outline"
                              color="gray"
                              radius="sm"
                              ff="monospace"
                              fw={600}
                              styles={{ label: { textTransform: 'none' } }}
                            >
                              {asset.code}
                            </Badge>

                            {asset.notes && (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                • {asset.notes}
                              </Text>
                            )}
                          </Group>
                        </Box>
                      </Group>
                    </Table.Td>

                    {/* Category & Date */}
                    <Table.Td>
                      <Badge variant="light" color={color} size="sm" radius="sm">
                        {t(
                          `category${asset.category.charAt(0).toUpperCase() + asset.category.slice(1)}` as any
                        )}
                      </Badge>
                      <Text size="xs" c="dimmed" mt={4}>
                        Beli: {asset.acquisitionDate}
                      </Text>
                    </Table.Td>

                    {/* Acquisition Cost */}
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text
                        fw={700}
                        size="sm"
                        c="dark.8"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatCurrency(cost)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Residu: {formatCurrency(asset.residualValue)}
                      </Text>
                    </Table.Td>

                    {/* Net Book Value & Dep Progress */}
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text
                        fw={800}
                        size="sm"
                        c="teal.8"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatCurrency(nbv)}
                      </Text>
                      {asset.depreciationMethod !== 'none' ? (
                        <Group gap={4} justify="flex-end" mt={2}>
                          <Text size="xs" c="dimmed">
                            Susut: {depRatio}%
                          </Text>
                        </Group>
                      ) : (
                        <Text size="xs" c="dimmed">
                          Bebas Susut
                        </Text>
                      )}
                    </Table.Td>

                    {/* Status */}
                    <Table.Td style={{ textAlign: 'center' }}>
                      {asset.status === 'active' ? (
                        <Badge variant="light" color="teal" size="sm" radius="sm">
                          {t('statusActive')}
                        </Badge>
                      ) : asset.status === 'fully_depreciated' ? (
                        <Badge variant="filled" color="gray" size="sm" radius="sm">
                          {t('statusFullyDepreciated')}
                        </Badge>
                      ) : (
                        <Badge variant="light" color="orange" size="sm" radius="sm">
                          {t('statusDisposed')}
                        </Badge>
                      )}
                    </Table.Td>

                    {/* Actions */}
                    <Table.Td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <Menu position="bottom-end" shadow="md" width={220} withArrow>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" radius="md">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Label>Opsi Aset Tetap</Menu.Label>

                          {onViewDetail && (
                            <Menu.Item
                              leftSection={<IconEye size={15} />}
                              onClick={() => onViewDetail(asset)}
                            >
                              Detail Lengkap Aset
                            </Menu.Item>
                          )}

                          <Menu.Item
                            leftSection={<IconCalendarStats size={15} />}
                            onClick={() => onViewSchedule(asset)}
                          >
                            {t('viewSchedule')}
                          </Menu.Item>

                          <Menu.Item
                            leftSection={<IconPencil size={15} />}
                            onClick={() => onEdit(asset)}
                          >
                            {t('editAsset')}
                          </Menu.Item>

                          {asset.status !== 'disposed' && (
                            <Menu.Item
                              leftSection={<IconScale size={15} />}
                              onClick={() => onDispose(asset)}
                            >
                              {t('disposeAsset')}
                            </Menu.Item>
                          )}

                          <Menu.Divider />

                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={15} />}
                            onClick={() => onDelete(asset)}
                          >
                            {t('deleteAsset')}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Pagination & Summary Footer */}
      {filteredAssets.length > 0 && (
        <Group justify="space-between" align="center" wrap="wrap" mt="xs">
          <Text size="xs" c="dimmed">
            Menampilkan{' '}
            <Text span fw={600} c="dark.7">
              {Math.min((page - 1) * PAGE_SIZE + 1, filteredAssets.length)}
            </Text>{' '}
            -{' '}
            <Text span fw={600} c="dark.7">
              {Math.min(page * PAGE_SIZE, filteredAssets.length)}
            </Text>{' '}
            dari{' '}
            <Text span fw={600} c="dark.7">
              {filteredAssets.length}
            </Text>{' '}
            unit aset tetap
          </Text>

          {totalPages > 1 && (
            <Pagination
              value={page}
              onChange={setPage}
              total={totalPages}
              radius="md"
              size="sm"
              color="primary"
            />
          )}
        </Group>
      )}
    </Stack>
  );
};

export default AssetTable;
