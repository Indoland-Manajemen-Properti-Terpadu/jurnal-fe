import React from 'react';
import { Box, Paper, Stack, Tabs } from '@mantine/core';
import { IconBook2, IconBuildingWarehouse, IconTrendingDown } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { AssetDepreciationPanel } from '@/module/assets/presentation/components/AssetDepreciationPanel';
import { AssetDetailHeader } from '@/module/assets/presentation/components/AssetDetailHeader';
import { AssetPendingNotice } from '@/module/assets/presentation/components/AssetDetailNotices';
import { AssetDetailSidebar } from '@/module/assets/presentation/components/AssetDetailSidebar';
import {
  AssetDetailSkeleton,
  AssetNotFound,
} from '@/module/assets/presentation/components/AssetDetailStates';
import { AssetDialogs } from '@/module/assets/presentation/components/AssetDialogs';
import { AssetJournalList } from '@/module/assets/presentation/components/AssetJournalList';
import { AssetOverviewPanel } from '@/module/assets/presentation/components/AssetOverviewPanel';
import { AssetValueSummary } from '@/module/assets/presentation/components/AssetValueSummary';
import classes from '@/module/assets/presentation/components/AssetDetail.module.css';
import { useAssetDialogs } from '@/module/assets/presentation/hooks/useAssetDialogs';
import { useAsset, useAssetJournals } from '@/module/assets/presentation/hooks/useAssetQueries';

const TABS = ['details', 'depreciation', 'journals'] as const;
type DetailTab = (typeof TABS)[number];

const isDetailTab = (value: string | null): value is DetailTab => TABS.includes(value as DetailTab);

/**
 * Route `/assets/:id`, built like the contact detail: the header, the book value, the tabs in a
 * card of their own, then each tab as separate cards. Only the details tab has a side column
 * (ledger accounts and vendor); the other tabs use the full width. The open tab lives in `?tab=` so it survives a reload and can be shared. The router
 * wraps it in `AppShellLayout`.
 */
export const AssetDetailPage: React.FC = () => {
  const { t } = useTranslation('assets');
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: asset, isLoading } = useAsset(id);
  const dialogs = useAssetDialogs();
  const journals = useAssetJournals(id, Boolean(asset) && asset?.status !== 'pending');

  const requested = searchParams.get('tab');
  const tab: DetailTab = isDetailTab(requested) ? requested : 'details';
  const changeTab = (next: string | null) => {
    if (!isDetailTab(next)) return;
    setSearchParams(
      (params) => {
        if (next === 'details') params.delete('tab');
        else params.set('tab', next);
        return params;
      },
      { replace: true }
    );
  };

  const goToList = () => navigate(routes.assets.main);

  if (isLoading) return <AssetDetailSkeleton />;
  if (!asset) return <AssetNotFound onBack={goToList} />;

  const openEdit = () => dialogs.open({ kind: 'form', asset });
  const openRevise = () => dialogs.open({ kind: 'revise', asset });
  // Written like the status tabs of the list, "Jurnal (2)"; a pending asset has none yet.
  const journalCount = asset.status === 'pending' ? 0 : journals.data?.length;

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <AssetDetailHeader
            asset={asset}
            onBack={goToList}
            onEdit={openEdit}
            onRevise={openRevise}
            onDispose={() => dialogs.open({ kind: 'dispose', asset })}
          />

          {asset.status === 'pending' && (
            <AssetPendingNotice onActivate={() => dialogs.open({ kind: 'activate', asset })} />
          )}

          <AssetValueSummary asset={asset} />

          <Tabs
            value={tab}
            onChange={changeTab}
            color="primary"
            variant="pills"
            radius="md"
            keepMounted={false}
          >
            <Paper withBorder radius="lg" p="sm" mb="lg" shadow="none" bg="white">
              <Tabs.List className={classes.tabList}>
                <Tabs.Tab value="details" leftSection={<IconBuildingWarehouse size={16} />}>
                  {t('tabDetails')}
                </Tabs.Tab>
                <Tabs.Tab value="depreciation" leftSection={<IconTrendingDown size={16} />}>
                  {t('tabDepreciation')}
                </Tabs.Tab>
                <Tabs.Tab value="journals" leftSection={<IconBook2 size={16} />}>
                  {journalCount === undefined
                    ? t('tabJournals')
                    : `${t('tabJournals')} (${journalCount})`}
                </Tabs.Tab>
              </Tabs.List>
            </Paper>

            <Tabs.Panel value="details">
              <div className={classes.detailGrid}>
                <AssetOverviewPanel asset={asset} onEdit={openEdit} />
                <AssetDetailSidebar asset={asset} onEdit={openEdit} />
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="depreciation">
              <AssetDepreciationPanel asset={asset} onRevise={openRevise} />
            </Tabs.Panel>
            <Tabs.Panel value="journals">
              <AssetJournalList journals={journals.data ?? []} loading={journals.isLoading} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Box>

      <AssetDialogs dialog={dialogs.dialog} onClose={dialogs.close} />
    </>
  );
};

export default AssetDetailPage;
