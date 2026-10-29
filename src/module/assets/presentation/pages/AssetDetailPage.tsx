import React, { useMemo, useState } from 'react';
import { Box, Grid, Stack } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { AssetItem } from '@/module/assets/domain/asset';
import { generateDepreciationSchedule } from '@/module/assets/domain/depreciation';
import AssetDetailActionBar from '@/module/assets/presentation/components/AssetDetailActionBar';
import AssetDetailHero from '@/module/assets/presentation/components/AssetDetailHero';
import AssetDetailScheduleCard from '@/module/assets/presentation/components/AssetDetailScheduleCard';
import {
  AssetDetailSkeleton,
  AssetNotFound,
} from '@/module/assets/presentation/components/AssetDetailStates';
import AssetDetailSummary from '@/module/assets/presentation/components/AssetDetailSummary';
import AssetDisposalModal from '@/module/assets/presentation/components/AssetDisposalModal';
import AssetDisposalNotice from '@/module/assets/presentation/components/AssetDisposalNotice';
import AssetFormModal from '@/module/assets/presentation/components/AssetFormModal';
import { useAssets } from '@/module/assets/presentation/hooks/useAssets';

/** Route `/assets/:id`. The router wraps it in `AppShellLayout`. */
export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('assets');
  const { assets, isLoading, deleteAsset, saveAsset, disposeAsset } = useAssets();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [disposalModalOpen, setDisposalModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const asset: AssetItem | undefined = useMemo(() => assets.find((a) => a.id === id), [assets, id]);

  const schedule = useMemo(() => (asset ? generateDepreciationSchedule(asset) : []), [asset]);

  const goToList = () => navigate(routes.baseModules.assets);

  if (isLoading) return <AssetDetailSkeleton />;
  if (!asset) return <AssetNotFound onBack={goToList} />;

  const handleDelete = () => {
    deleteAsset(asset.id, asset.name);
    setDeleteConfirmOpen(false);
    goToList();
  };

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <AssetDetailActionBar
            status={asset.status}
            onBack={goToList}
            onEdit={() => setEditModalOpen(true)}
            onDispose={() => setDisposalModalOpen(true)}
            onDelete={() => setDeleteConfirmOpen(true)}
          />

          <AssetDetailHero asset={asset} />

          {asset.status === 'disposed' && <AssetDisposalNotice asset={asset} />}

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <AssetDetailScheduleCard asset={asset} schedule={schedule} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <AssetDetailSummary asset={asset} />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      <AssetFormModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={saveAsset}
        assetToEdit={asset}
      />

      <AssetDisposalModal
        opened={disposalModalOpen}
        onClose={() => setDisposalModalOpen(false)}
        asset={asset}
        onConfirmDisposal={disposeAsset}
      />

      <ConfirmModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t('detailDeleteTitle')}
        message={t('detailDeleteMessage', { name: asset.name })}
        helperText={t('detailDeleteHelper')}
        confirmLabel={t('deleteAsset')}
        cancelLabel={t('cancel')}
      />
    </>
  );
};

export default AssetDetailPage;
