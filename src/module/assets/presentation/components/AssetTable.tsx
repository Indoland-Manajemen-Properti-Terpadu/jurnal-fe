import React, { useMemo, useState } from 'react';
import { Box, Stack, Table, Text } from '@mantine/core';
import { IconCoins, IconPlus, IconSearch } from '@tabler/icons-react';
import EmptyState from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { AssetItem } from '@/module/assets/domain/asset';
import {
  DEFAULT_ASSET_SORT,
  countAssetsByCategory,
  filterAssets,
  sortAssets,
} from '@/module/assets/domain/assetFilters';
import AssetTableFooter from '@/module/assets/presentation/components/AssetTableFooter';
import AssetTableSkeletonRows from '@/module/assets/presentation/components/AssetTableSkeletonRows';
import AssetTableFilters from '@/module/assets/presentation/components/AssetTableFilters';
import AssetTableRow from '@/module/assets/presentation/components/AssetTableRow';

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

const HEADER_TEXT_PROPS = { size: 'xs', fw: 700, c: 'dimmed', tt: 'uppercase', lts: 0.5 } as const;

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
  const [sortBy, setSortBy] = useState<string>(DEFAULT_ASSET_SORT);
  const [page, setPage] = useState<number>(1);

  const categoryCounts = useMemo(() => countAssetsByCategory(assets), [assets]);

  const filteredAssets = useMemo(
    () => sortAssets(filterAssets(assets, categoryFilter, searchQuery), sortBy),
    [assets, categoryFilter, searchQuery, sortBy]
  );

  const paginatedAssets = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAssets.slice(start, start + PAGE_SIZE);
  }, [filteredAssets, page]);

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setSortBy(DEFAULT_ASSET_SORT);
    setPage(1);
  };

  const renderBody = () => {
    if (loading) return <AssetTableSkeletonRows />;

    if (paginatedAssets.length === 0) {
      return (
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
      );
    }

    return paginatedAssets.map((asset) => (
      <AssetTableRow
        key={asset.id}
        asset={asset}
        onViewSchedule={onViewSchedule}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onDispose={onDispose}
        onDelete={onDelete}
      />
    ));
  };

  return (
    <Stack gap="md">
      <AssetTableFilters
        categoryFilter={categoryFilter}
        onCategoryChange={(category) => {
          setCategoryFilter(category);
          setPage(1);
        }}
        counts={categoryCounts}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        onClearSearch={() => setSearchQuery('')}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onRefresh={onRefresh}
        loading={loading}
      />

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
                <Text {...HEADER_TEXT_PROPS}>
                  {t('name')} & {t('code')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '15%' }}>
                <Text {...HEADER_TEXT_PROPS}>{t('category')}</Text>
              </Table.Th>
              <Table.Th style={{ width: '18%', textAlign: 'right' }}>
                <Text {...HEADER_TEXT_PROPS}>{t('acquisitionCost')}</Text>
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>
                <Text {...HEADER_TEXT_PROPS}>{t('currentNBV')}</Text>
              </Table.Th>
              <Table.Th style={{ width: '12%', textAlign: 'center' }}>
                <Text {...HEADER_TEXT_PROPS}>{t('status')}</Text>
              </Table.Th>
              <Table.Th style={{ width: '8%', textAlign: 'center' }}>
                <Text {...HEADER_TEXT_PROPS}>{t('actions')}</Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>{renderBody()}</Table.Tbody>
        </Table>
      </Box>

      {filteredAssets.length > 0 && (
        <AssetTableFooter
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filteredAssets.length}
          onPageChange={setPage}
        />
      )}
    </Stack>
  );
};

export default AssetTable;
