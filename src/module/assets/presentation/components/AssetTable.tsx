import React from 'react';
import { Paper, Skeleton, Stack, Table, Tabs, Text } from '@mantine/core';
import { IconCoins, IconPlus, IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type {
  AssetItem,
  AssetPagination,
  AssetStatus,
  AssetSummary,
} from '@/module/assets/domain/asset';
import {
  ALL_TAB,
  AssetListToolbar,
  AssetStatusTabsList,
} from '@/module/assets/presentation/components/AssetTableFilters';
import { AssetTableFooter } from '@/module/assets/presentation/components/AssetTableFooter';
import { AssetTableRow } from '@/module/assets/presentation/components/AssetTableRow';
import type { useAssetListParams } from '@/module/assets/presentation/hooks/useAssetListParams';

export type AssetTableProps = {
  assets: AssetItem[];
  pagination?: AssetPagination;
  counts?: AssetSummary['counts'];
  filters: ReturnType<typeof useAssetListParams>;
  loading?: boolean;
  onAddNew: () => void;
  onViewDetail: (asset: AssetItem) => void;
};

const COLUMN_COUNT = 7;
const SKELETON_ROWS = 5;

/** Status tabs, search, sort and the asset table in one card, as on the account list. */
export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  pagination,
  counts,
  filters,
  loading = false,
  onAddNew,
  onViewDetail,
}) => {
  const { t } = useTranslation('assets');

  const headerLabel = (label: string, minWidth: number, right?: boolean, center?: boolean) => (
    <Table.Th
      ta={right ? 'right' : center ? 'center' : undefined}
      miw={minWidth}
      style={{ whiteSpace: 'nowrap' }}
    >
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        {label}
      </Text>
    </Table.Th>
  );

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={COLUMN_COUNT}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }

    if (assets.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMN_COUNT} p={0}>
            {filters.hasFilters ? (
              <EmptyState
                title={t('noAssetsFound')}
                description={t('noAssetsFoundDesc')}
                icon={<IconSearch size={36} stroke={1.5} />}
                actionLabel={t('resetFilter')}
                onAction={filters.reset}
                py={48}
              />
            ) : (
              <EmptyState
                title={t('noAssetsYet')}
                description={t('noAssetsYetDesc')}
                icon={<IconCoins size={36} stroke={1.5} />}
                actionLabel={t('addAsset')}
                actionIcon={<IconPlus size={14} />}
                onAction={onAddNew}
                py={48}
              />
            )}
          </Table.Td>
        </Table.Tr>
      );
    }

    return assets.map((asset) => (
      <AssetTableRow key={asset.id} asset={asset} onViewDetail={onViewDetail} />
    ));
  };

  return (
    <Tabs
      value={filters.status ?? ALL_TAB}
      onChange={(value) =>
        filters.setStatus(value && value !== ALL_TAB ? (value as AssetStatus) : undefined)
      }
      color="primary"
      variant="pills"
      radius="md"
    >
      <AssetStatusTabsList counts={counts} />

      <Stack gap="md">
        <AssetListToolbar
          searchInput={filters.searchInput}
          onSearchChange={filters.setSearchInput}
          sort={filters.sort}
          onSortChange={filters.setSort}
        />

        <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
          <Table.ScrollContainer minWidth={820}>
            <Table verticalSpacing="sm" horizontalSpacing="xs" highlightOnHover>
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  {headerLabel(t('code'), 100)}
                  {headerLabel(t('name'), 160)}
                  {headerLabel(t('category'), 90)}
                  {headerLabel(t('acquisitionCost'), 110, true)}
                  {headerLabel(t('currentNBV'), 110, true)}
                  {headerLabel(t('status'), 120)}
                  {headerLabel(t('actions'), 56, false, true)}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{renderBody()}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>

        {pagination && pagination.total > 0 && !loading && (
          <AssetTableFooter
            page={pagination.page}
            pageSize={pagination.limit}
            totalItems={pagination.total}
            onPageChange={filters.setPage}
          />
        )}
      </Stack>
    </Tabs>
  );
};

export default AssetTable;
