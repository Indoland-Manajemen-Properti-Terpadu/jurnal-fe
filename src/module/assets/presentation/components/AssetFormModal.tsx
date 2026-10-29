import React from 'react';
import { Box, Button, Group, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBuildingWarehouse, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { AssetFormValues, AssetItem } from '@/module/assets/domain/asset';
import AssetFormAccountingSection from '@/module/assets/presentation/components/AssetFormAccountingSection';
import AssetFormIdentitySection from '@/module/assets/presentation/components/AssetFormIdentitySection';
import AssetFormPreview from '@/module/assets/presentation/components/AssetFormPreview';
import { useAssetForm } from '@/module/assets/presentation/hooks/useAssetForm';

export type AssetFormModalProps = {
  opened: boolean;
  onClose: () => void;
  onSave: (values: AssetFormValues) => void;
  assetToEdit?: AssetItem | null;
};

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  opened,
  onClose,
  onSave,
  assetToEdit,
}) => {
  const { t } = useTranslation('assets');
  const { form, liveCost, liveMethod, estimate, preview } = useAssetForm(opened, assetToEdit);

  const handleSubmit = (values: AssetFormValues) => {
    onSave(values);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon
            size={36}
            radius="md"
            variant="gradient"
            gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
          >
            <IconBuildingWarehouse size={20} stroke={1.8} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md" c="dark.9" lh={1.2}>
              {assetToEdit ? t('formTitleEdit') : t('formTitleCreate')}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {t('formSubtitle')}
            </Text>
          </Box>
        </Group>
      }
      size="lg"
      radius="lg"
      centered
      padding="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <AssetFormIdentitySection form={form} />
          <AssetFormAccountingSection form={form} />
          <AssetFormPreview
            method={liveMethod}
            cost={liveCost}
            estimate={estimate}
            preview={preview}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose} radius="md">
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
              radius="md"
              leftSection={assetToEdit ? undefined : <IconPlus size={16} />}
            >
              {assetToEdit ? t('updateAsset') : t('saveAsset')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AssetFormModal;
