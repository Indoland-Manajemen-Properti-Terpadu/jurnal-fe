import { Alert, Button, Group, Modal, Stack } from '@mantine/core';
import { IconCircleCheck, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ActivationValues, AssetItem } from '@/module/assets/domain/asset';
import { AssetActivationFields } from '@/module/assets/presentation/components/AssetActivationFields';
import { AssetModalTitle } from '@/module/assets/presentation/components/AssetModalTitle';
import { useActivationForm } from '@/module/assets/presentation/hooks/useActivationForm';
import {
  useActivateAsset,
  useAssetAccounts,
  useReviseAsset,
} from '@/module/assets/presentation/hooks/useAssetQueries';

export type AssetActivationModalProps = {
  asset: AssetItem;
  /** `activate` puts a pending asset in the books; `revise` changes an active asset's terms. */
  mode: 'activate' | 'revise';
  onClose: () => void;
};

export function AssetActivationModal({
  asset,
  mode,
  onClose,
}: Readonly<AssetActivationModalProps>) {
  const { t } = useTranslation('assets');
  const accounts = useAssetAccounts(true);
  const activate = useActivateAsset(asset.id);
  const revise = useReviseAsset(asset.id);
  const mutation = mode === 'activate' ? activate : revise;
  const form = useActivationForm(asset, () => asset.acquisitionCost);

  const handleSubmit = async (values: ActivationValues) => {
    try {
      await mutation.mutateAsync(values);
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
          icon={IconCircleCheck}
          title={mode === 'activate' ? t('activateTitle') : t('reviseTitle')}
          subtitle={`${asset.code} · ${asset.name}`}
        />
      }
      size="lg"
      radius="lg"
      centered
      padding="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Alert variant="light" color="primary" radius="md" icon={<IconInfoCircle size={18} />}>
            {mode === 'activate' ? t('activateNotice') : t('reviseNotice')}
          </Alert>

          <AssetActivationFields
            form={form}
            accounts={accounts.data ?? []}
            loadingAccounts={accounts.isLoading}
            acquisitionCost={asset.acquisitionCost}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" radius="md" onClick={onClose} disabled={mutation.isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" radius="md" loading={mutation.isPending}>
              {mode === 'activate' ? t('activateAction') : t('reviseAction')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default AssetActivationModal;
