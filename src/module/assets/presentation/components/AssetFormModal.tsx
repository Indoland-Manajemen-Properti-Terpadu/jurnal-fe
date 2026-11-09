import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Switch, Text } from '@mantine/core';
import { IconBuildingWarehouse, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AssetFormValues, AssetItem } from '@/module/assets/domain/asset';
import { getAssetEditRights } from '@/module/assets/domain/assetRules';
import { AssetActivationFields } from '@/module/assets/presentation/components/AssetActivationFields';
import { AssetFormIdentitySection } from '@/module/assets/presentation/components/AssetFormIdentitySection';
import { AssetModalTitle } from '@/module/assets/presentation/components/AssetModalTitle';
import { useActivationForm } from '@/module/assets/presentation/hooks/useActivationForm';
import { useAssetForm } from '@/module/assets/presentation/hooks/useAssetForm';
import {
  useAssetAccounts,
  useAssetTags,
  useCreateAsset,
  useUpdateAsset,
} from '@/module/assets/presentation/hooks/useAssetQueries';

export type AssetFormModalProps = {
  /** The asset to edit; leave out to add a new one. */
  asset?: AssetItem | null;
  onClose: () => void;
};

const ALL_RIGHTS = { details: true, terms: true, tags: true } as const;

export function AssetFormModal({ asset, onClose }: Readonly<AssetFormModalProps>) {
  const { t } = useTranslation('assets');
  const editing = Boolean(asset);
  const rights = asset ? getAssetEditRights(asset) : ALL_RIGHTS;
  const fromProapps = asset?.source === 'proapps';

  const [activateNow, setActivateNow] = useState(false);
  const tags = useAssetTags();
  const accounts = useAssetAccounts(activateNow);
  const create = useCreateAsset();
  const update = useUpdateAsset(asset?.id ?? '', rights);
  const pending = create.isPending || update.isPending;

  const form = useAssetForm(asset);
  const activationForm = useActivationForm(null, () => Number(form.values.acquisitionCost) || 0);

  const handleSubmit = async (values: AssetFormValues) => {
    try {
      if (editing) {
        await update.mutateAsync(values);
      } else {
        if (activateNow && activationForm.validate().hasErrors) return;
        await create.mutateAsync({
          values,
          activation: activateNow ? activationForm.values : undefined,
        });
      }
      onClose();
    } catch {
      // The mutation already shows the failure; the form stays open with the entered values.
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <AssetModalTitle
          icon={IconBuildingWarehouse}
          title={editing ? t('formTitleEdit') : t('formTitleCreate')}
          subtitle={t('formSubtitle')}
        />
      }
      size={activateNow ? 'xl' : 'lg'}
      radius="lg"
      centered
      padding="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {fromProapps && (
            <Alert variant="light" color="primary" radius="md" icon={<IconInfoCircle size={18} />}>
              {t('proappsDataNotice')}
            </Alert>
          )}

          <AssetFormIdentitySection form={form} rights={rights} tags={tags.data ?? []} />

          {!editing && (
            <Stack gap="md">
              <Switch
                checked={activateNow}
                onChange={(event) => setActivateNow(event.currentTarget.checked)}
                label={t('activateNowLabel')}
                description={t('activateNowHint')}
              />
              {activateNow && (
                <AssetActivationFields
                  form={activationForm}
                  accounts={accounts.data ?? []}
                  loadingAccounts={accounts.isLoading}
                  acquisitionCost={Number(form.values.acquisitionCost) || 0}
                />
              )}
            </Stack>
          )}

          <Group justify="space-between" align="center" gap="sm">
            <Text size="xs" c="dimmed">
              {editing || activateNow ? '' : t('pendingHint')}
            </Text>
            <Group gap="sm">
              <Button variant="default" onClick={onClose} radius="md" disabled={pending}>
                {t('cancel')}
              </Button>
              <Button type="submit" radius="md" loading={pending}>
                {editing ? t('updateAsset') : activateNow ? t('saveAndActivate') : t('saveAsset')}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default AssetFormModal;
