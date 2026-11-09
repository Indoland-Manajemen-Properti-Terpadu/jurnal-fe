import React from 'react';
import { ActionIcon, Box, Button, Group, Paper, Stack, Tooltip } from '@mantine/core';
import { IconBuildingWarehouse, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { AssetListParams } from '@/module/assets/domain/asset';
import { AssetDialogs } from '@/module/assets/presentation/components/AssetDialogs';
import { AssetStatsGrid } from '@/module/assets/presentation/components/AssetStatsGrid';
import { AssetTable } from '@/module/assets/presentation/components/AssetTable';
import { useAssetDialogs } from '@/module/assets/presentation/hooks/useAssetDialogs';
import { useAssetListParams } from '@/module/assets/presentation/hooks/useAssetListParams';
import { useAssetSummary, useAssets } from '@/module/assets/presentation/hooks/useAssetQueries';

export function AssetPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('assets');
  const filters = useAssetListParams();

  const listParams: AssetListParams = {
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
  const list = useAssets(listParams);
  const summary = useAssetSummary();

  const dialogs = useAssetDialogs();

  const refetch = () => {
    list.refetch();
    summary.refetch();
  };

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconBuildingWarehouse}
            title={t('moduleTitle')}
            description={t('moduleSubtitle')}
            actions={
              <Group gap="sm" wrap="wrap">
                <Tooltip label={t('refreshData')} withArrow>
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    aria-label={t('refreshData')}
                    onClick={refetch}
                    loading={list.isFetching || summary.isFetching}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                <Button
                  color="primary"
                  size="md"
                  radius="md"
                  leftSection={<IconPlus size={18} />}
                  onClick={() => dialogs.open({ kind: 'form', asset: null })}
                >
                  {t('addAsset')}
                </Button>
              </Group>
            }
          />

          <AssetStatsGrid summary={summary.data} loading={summary.isLoading} />

          <Paper withBorder radius="lg" p="md" bg="white">
            <AssetTable
              assets={list.data?.items ?? []}
              pagination={list.data?.pagination}
              counts={summary.data?.counts}
              filters={filters}
              loading={list.isLoading}
              onAddNew={() => dialogs.open({ kind: 'form', asset: null })}
              onViewDetail={(asset) => navigate(routes.assets.detail.replace(':id', asset.id))}
            />
          </Paper>
        </Stack>
      </Box>

      <AssetDialogs dialog={dialogs.dialog} onClose={dialogs.close} />
    </>
  );
}

export default AssetPage;
