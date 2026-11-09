import React from 'react';
import { Box, Grid, Stack } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/router/routes';
import { AssetDetailHeader } from '@/module/assets/presentation/components/AssetDetailHeader';
import { AssetDetailInfo } from '@/module/assets/presentation/components/AssetDetailInfo';
import { AssetDetailJournals } from '@/module/assets/presentation/components/AssetDetailJournals';
import { AssetPendingNotice } from '@/module/assets/presentation/components/AssetDetailNotices';
import { AssetDetailScheduleCard } from '@/module/assets/presentation/components/AssetDetailScheduleCard';
import {
  AssetDetailSkeleton,
  AssetNotFound,
} from '@/module/assets/presentation/components/AssetDetailStates';
import { AssetDialogs } from '@/module/assets/presentation/components/AssetDialogs';
import { AssetValueSummary } from '@/module/assets/presentation/components/AssetValueSummary';
import { useAssetDialogs } from '@/module/assets/presentation/hooks/useAssetDialogs';
import { useAsset, useAssetJournals } from '@/module/assets/presentation/hooks/useAssetQueries';

/**
 * Route `/assets/:id`. Top to bottom: who the asset is and what can be done, its value, then its
 * schedule and journals beside the reference card that describes it. The router wraps it in
 * `AppShellLayout`.
 */
export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: asset, isLoading } = useAsset(id);
  const dialogs = useAssetDialogs();
  const journals = useAssetJournals(id, Boolean(asset) && asset?.status !== 'pending');

  const goToList = () => navigate(routes.assets.main);

  if (isLoading) return <AssetDetailSkeleton />;
  if (!asset) return <AssetNotFound onBack={goToList} />;

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <AssetDetailHeader
            asset={asset}
            onBack={goToList}
            onEdit={() => dialogs.open({ kind: 'form', asset })}
            onRevise={() => dialogs.open({ kind: 'revise', asset })}
            onDispose={() => dialogs.open({ kind: 'dispose', asset })}
          />

          {asset.status === 'pending' && (
            <AssetPendingNotice onActivate={() => dialogs.open({ kind: 'activate', asset })} />
          )}

          <AssetValueSummary asset={asset} />

          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                <AssetDetailScheduleCard asset={asset} />
                {asset.status !== 'pending' && (
                  <AssetDetailJournals
                    journals={journals.data ?? []}
                    loading={journals.isLoading}
                  />
                )}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <AssetDetailInfo asset={asset} />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      <AssetDialogs dialog={dialogs.dialog} onClose={dialogs.close} />
    </>
  );
};

export default AssetDetailPage;
