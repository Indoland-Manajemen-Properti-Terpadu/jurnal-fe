import { Button, Group, Menu, Text } from '@mantine/core';
import {
  IconArrowLeft,
  IconChevronDown,
  IconCoins,
  IconDotsVertical,
  IconEdit,
  IconScale,
  IconTrendingDown,
} from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import { canDisposeAsset, canEditAsset, canReviseAsset } from '@/module/assets/domain/assetRules';
import {
  ASSET_STATUS_LABEL_KEY,
  ASSET_STATUS_TEXT_COLOR,
} from '@/module/assets/presentation/components/assetStatusMeta';

export type AssetDetailHeaderProps = {
  asset: AssetItem;
  onBack: () => void;
  onEdit: () => void;
  onRevise: () => void;
  onDispose: () => void;
};

/**
 * Shared module header: the asset's name, then its status, code, category and origin as one line
 * of text. Back is a button of its own; every other action sits in the "more actions" menu.
 */
export function AssetDetailHeader({
  asset,
  onBack,
  onEdit,
  onRevise,
  onDispose,
}: Readonly<AssetDetailHeaderProps>) {
  const { t } = useTranslation('assets');
  const canEdit = canEditAsset(asset);
  const canRevise = canReviseAsset(asset);
  const canDispose = canDisposeAsset(asset);

  return (
    <ModuleHeader
      icon={IconCoins}
      title={asset.name}
      description={
        <>
          <Text span fw={600} c={ASSET_STATUS_TEXT_COLOR[asset.status]}>
            {t(ASSET_STATUS_LABEL_KEY[asset.status])}
          </Text>
          {' · '}
          {asset.code}
        </>
      }
      actions={
        <Group gap="xs" wrap="wrap">
          <Button
            variant="default"
            size="md"
            radius="md"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            {t('back')}
          </Button>

          {(canEdit || canRevise || canDispose) && (
            <Menu width={240} position="bottom-end" shadow="md" radius="md" withinPortal>
              <Menu.Target>
                <Button
                  variant="default"
                  size="md"
                  radius="md"
                  leftSection={<IconDotsVertical size={16} />}
                  rightSection={<IconChevronDown size={14} />}
                >
                  {t('moreActions')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {canEdit && (
                  <Menu.Item leftSection={<IconEdit size={16} />} onClick={onEdit}>
                    {t('editData')}
                  </Menu.Item>
                )}
                {canRevise && (
                  <Menu.Item leftSection={<IconTrendingDown size={16} />} onClick={onRevise}>
                    {t('reviseShort')}
                  </Menu.Item>
                )}
                {canDispose && (
                  <Menu.Item leftSection={<IconScale size={16} />} onClick={onDispose}>
                    {t('disposeShort')}
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      }
    />
  );
}

export default AssetDetailHeader;
