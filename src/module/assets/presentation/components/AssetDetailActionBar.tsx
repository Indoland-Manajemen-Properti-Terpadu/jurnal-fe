import { Button, Group, Paper } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconScale, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { AssetItem } from '@/module/assets/domain/asset';

export type AssetDetailActionBarProps = {
  status: AssetItem['status'];
  onBack: () => void;
  onEdit: () => void;
  onDispose: () => void;
  onDelete: () => void;
};

export function AssetDetailActionBar({
  status,
  onBack,
  onEdit,
  onDispose,
  onDelete,
}: Readonly<AssetDetailActionBarProps>) {
  const { t } = useTranslation('assets');

  return (
    <Paper withBorder radius="lg" p={{ base: 'sm', sm: 'md' }} bg="white">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
        >
          {t('backToList')}
        </Button>

        <Group gap="xs">
          <Button variant="default" size="sm" leftSection={<IconEdit size={16} />} onClick={onEdit}>
            {t('editData')}
          </Button>

          {status !== 'disposed' && (
            <Button
              variant="outline"
              color="orange"
              size="sm"
              leftSection={<IconScale size={16} />}
              onClick={onDispose}
            >
              {t('disposeShort')}
            </Button>
          )}

          <Button
            variant="subtle"
            color="red"
            size="sm"
            leftSection={<IconTrash size={16} />}
            onClick={onDelete}
          >
            {t('deleteShort')}
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}

export default AssetDetailActionBar;
