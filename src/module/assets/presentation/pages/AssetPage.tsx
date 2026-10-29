import React, { useState } from 'react';
import { ActionIcon, Box, Button, Group, Paper, Stack, Tooltip } from '@mantine/core';
import { IconBuildingWarehouse, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { routes } from '@/router/routes';
import AssetStatsGrid from '@/module/assets/presentation/components/AssetStatsGrid';
import AssetTable from '@/module/assets/presentation/components/AssetTable';
import AssetFormModal from '@/module/assets/presentation/components/AssetFormModal';
import AssetScheduleModal from '@/module/assets/presentation/components/AssetScheduleModal';
import AssetDisposalModal from '@/module/assets/presentation/components/AssetDisposalModal';
import { useAssets } from '@/module/assets/presentation/hooks/useAssets';
import { AssetItem } from '@/module/assets/domain/asset';
import { useTranslation } from '@/i18n';

export function AssetPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('assets');
  const { assets, isLoading, refetch, saveAsset, deleteAsset, disposeAsset } = useAssets();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<AssetItem | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [assetForSchedule, setAssetForSchedule] = useState<AssetItem | null>(null);

  const [disposalModalOpen, setDisposalModalOpen] = useState(false);
  const [assetForDisposal, setAssetForDisposal] = useState<AssetItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<AssetItem | null>(null);

  // Handlers
  const handleAddNew = () => {
    setAssetToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (asset: AssetItem) => {
    setAssetToEdit(asset);
    setFormModalOpen(true);
  };

  const handleViewSchedule = (asset: AssetItem) => {
    setAssetForSchedule(asset);
    setScheduleModalOpen(true);
  };

  const handleOpenDisposal = (asset: AssetItem) => {
    setAssetForDisposal(asset);
    setDisposalModalOpen(true);
  };

  const handleDeleteRequest = (asset: AssetItem) => {
    setAssetToDelete(asset);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assetToDelete) {
      deleteAsset(assetToDelete.id, assetToDelete.name);
      setDeleteConfirmOpen(false);
      setAssetToDelete(null);
    }
  };

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Canonical Module Header */}
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
                    onClick={refetch}
                    loading={isLoading}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                <Button
                  variant="gradient"
                  gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
                  size="sm"
                  radius="md"
                  leftSection={<IconPlus size={16} />}
                  onClick={handleAddNew}
                >
                  {t('addAsset')}
                </Button>
              </Group>
            }
          />

          {/* KPI Stats Grid */}
          <AssetStatsGrid assets={assets} loading={isLoading} />

          {/* Main Content Container with Table */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <AssetTable
              assets={assets}
              loading={isLoading}
              onRefresh={refetch}
              onAddNew={handleAddNew}
              onEdit={handleEdit}
              onViewSchedule={handleViewSchedule}
              onViewDetail={(asset) =>
                navigate(routes.baseModules.assetDetail.replace(':id', asset.id))
              }
              onDispose={handleOpenDisposal}
              onDelete={handleDeleteRequest}
            />
          </Paper>
        </Stack>
      </Box>

      {/* Add / Edit Asset Modal */}
      <AssetFormModal
        opened={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={saveAsset}
        assetToEdit={assetToEdit}
      />

      {/* Depreciation Schedule Modal */}
      <AssetScheduleModal
        opened={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        asset={assetForSchedule}
      />

      {/* Disposal Modal */}
      <AssetDisposalModal
        opened={disposalModalOpen}
        onClose={() => setDisposalModalOpen(false)}
        asset={assetForDisposal}
        onConfirmDisposal={disposeAsset}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        opened={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setAssetToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('confirmDeleteTitle')}
        message={assetToDelete ? t('confirmDeleteMessage', { name: assetToDelete.name }) : ''}
        helperText={t('confirmDeleteHelper')}
        confirmLabel={t('deleteAsset')}
        cancelLabel={t('cancel')}
      />
    </>
  );
}

export default AssetPage;
